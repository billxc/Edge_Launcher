// compile with: /D_UNICODE /DUNICODE /DWIN32 /D_WINDOWS /c

#include <windows.h>
#include <stdlib.h>
#include <string>
#include <tchar.h>
#include <wrl.h>
#include <wil/com.h>
// <IncludeHeader>
// include WebView2 header
#include "WebView2.h"
#include "WebView2EnvironmentOptions.h"
#include <future>
#include "resource.h"
// </IncludeHeader>

using namespace Microsoft::WRL;

// Global variables

// The main window class name.
static TCHAR szWindowClass[] = _T("DesktopApp");

// The string that appears in the application's title bar.
static TCHAR szTitle[] = _T("Chromium Launcher");

HINSTANCE hInst;
HINSTANCE& g_hInst = hInst;
// Forward declarations of functions included in this code module:
LRESULT CALLBACK WndProc(HWND, UINT, WPARAM, LPARAM);

// Pointer to WebViewController
static wil::com_ptr<ICoreWebView2Controller> webviewController;
// static wil::com_ptr<ICoreWebView2Controller3> controller3;

// Pointer to WebView window
static wil::com_ptr<ICoreWebView2> webview;
static wil::com_ptr<ICoreWebView2_3> webview_2_3;
static std::vector<std::future<void>> g_futures;

void executeCommand(const std::wstring& command) {
	OutputDebugStringW(command.c_str());
	std::wstring cmd = L"cmd /C " + command;
	STARTUPINFO si = { sizeof(STARTUPINFO) };
	si.dwFlags = STARTF_USESHOWWINDOW;
	si.wShowWindow = SW_HIDE;
	PROCESS_INFORMATION pi;

	if (!CreateProcess(NULL, &cmd[0], NULL, NULL, FALSE, CREATE_NO_WINDOW, NULL, NULL, &si, &pi)) {
		// Handle error
	}

	// Optionally wait for the process to finish
	WaitForSingleObject(pi.hProcess, INFINITE);

	CloseHandle(pi.hProcess);
	CloseHandle(pi.hThread);
}


int CALLBACK WinMain(
	_In_ HINSTANCE hInstance,
	_In_ HINSTANCE hPrevInstance,
	_In_ LPSTR     lpCmdLine,
	_In_ int       nCmdShow
)
{
	WNDCLASSEX wcex;

	wcex.cbSize = sizeof(WNDCLASSEX);
	wcex.style = CS_HREDRAW | CS_VREDRAW;
	wcex.lpfnWndProc = WndProc;
	wcex.cbClsExtra = 0;
	wcex.cbWndExtra = 0;
	wcex.hInstance = hInstance;
	wcex.hIcon = LoadIcon(hInstance, MAKEINTRESOURCE(IDI_APPICON));
	wcex.hCursor = LoadCursor(NULL, IDC_ARROW);
	wcex.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
	wcex.lpszMenuName = NULL;
	wcex.lpszClassName = szWindowClass;
	wcex.hIconSm = LoadIcon(wcex.hInstance, MAKEINTRESOURCE(IDI_APPICON));

	if (!RegisterClassEx(&wcex))
	{
		MessageBox(NULL,
			_T("Call to RegisterClassEx failed!"),
			_T("Windows Desktop Guided Tour"),
			NULL);

		return 1;
	}

	// Store instance handle in our global variable
	hInst = hInstance;

	// The parameters to CreateWindow explained:
	// szWindowClass: the name of the application
	// szTitle: the text that appears in the title bar
	// WS_OVERLAPPEDWINDOW: the type of window to create
	// CW_USEDEFAULT, CW_USEDEFAULT: initial position (x, y)
	// 500, 100: initial size (width, length)
	// NULL: the parent of this window
	// NULL: this application does not have a menu bar
	// hInstance: the first parameter from WinMain
	// NULL: not used in this application
	HWND hWnd = CreateWindow(
		szWindowClass,
		szTitle,
		WS_OVERLAPPEDWINDOW,
		CW_USEDEFAULT, CW_USEDEFAULT,
		1200, 900,
		NULL,
		NULL,
		hInstance,
		NULL
	);

	if (!hWnd)
	{
		MessageBox(NULL,
			_T("Call to CreateWindow failed!"),
			_T("Windows Desktop Guided Tour"),
			NULL);

		return 1;
	}

	// The parameters to ShowWindow explained:
	// hWnd: the value returned from CreateWindow
	// nCmdShow: the fourth parameter from WinMain
	ShowWindow(hWnd,
		nCmdShow);
	UpdateWindow(hWnd);
	auto options = Microsoft::WRL::Make<CoreWebView2EnvironmentOptions>();
	options->put_AdditionalBrowserArguments(L"--enable-features=msWebView2EnableDraggableRegions");
	// <-- WebView2 sample code starts here -->
	// Step 3 - Create a single WebView within the parent window
	// Locate the browser and set up the environment for WebView
	CreateCoreWebView2EnvironmentWithOptions(nullptr, nullptr, options.Get(),
		Callback<ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler>(
			[hWnd](HRESULT result, ICoreWebView2Environment* env) -> HRESULT {

				// Create a CoreWebView2Controller and get the associated CoreWebView2 whose parent is the main window hWnd
				env->CreateCoreWebView2Controller(hWnd, Callback<ICoreWebView2CreateCoreWebView2ControllerCompletedHandler>(
					[hWnd](HRESULT result, ICoreWebView2Controller* controller) -> HRESULT {
						if (controller != nullptr) {
							webviewController = controller;
							// controller3 = webviewController.query<ICoreWebView2Controller3>();
							webviewController->get_CoreWebView2(&webview);
						}
						webview_2_3 = webview.query<ICoreWebView2_3>();

						// Add a few settings for the webview
						// The demo step is redundant since the values are the default settings
						wil::com_ptr<ICoreWebView2Settings> settings;
						webview->get_Settings(&settings);
						settings->put_IsScriptEnabled(TRUE);
						settings->put_AreDefaultScriptDialogsEnabled(TRUE);
						settings->put_IsWebMessageEnabled(TRUE);
						auto settings8 = settings.query<ICoreWebView2Settings8>();
						webview_2_3->SetVirtualHostNameToFolderMapping(L"chromium-launcher.localapp", L".", COREWEBVIEW2_HOST_RESOURCE_ACCESS_KIND_ALLOW);

						// Resize WebView to fit the bounds of the parent window
						RECT bounds;
						GetClientRect(hWnd, &bounds);
						webviewController->put_Bounds(bounds);

						// Schedule an async task to navigate to Bing
						webview->Navigate(L"https://chromium-launcher.localapp/index.html");

						EventRegistrationToken token;

						// <CommunicationHostWeb>
						// Step 6 - Communication between host and web content
						// Set an event handler for the host to return received message back to the web content
						webview->add_WebMessageReceived(Callback<ICoreWebView2WebMessageReceivedEventHandler>(
							[](ICoreWebView2* webview, ICoreWebView2WebMessageReceivedEventArgs* args) -> HRESULT {
								wil::unique_cotaskmem_string c_message;
								args->TryGetWebMessageAsString(&c_message);
								std::wstring msg(c_message.get());
								if (msg.substr(0, 4) == L"cmd:")
								{
									OutputDebugStringW(msg.c_str());
									g_futures.push_back(std::async(std::launch::async, [msg]() {
										executeCommand(std::wstring(msg.begin() + 4, msg.end()));
										// system(std::string(msg.begin() + 4, msg.end()).c_str());
										}));
								}
								return S_OK;
							}).Get(), &token);

						return S_OK;
					}).Get());
				return S_OK;
			}).Get());



	// <-- WebView2 sample code ends here -->

	// Main message loop:
	MSG msg;
	while (GetMessage(&msg, NULL, 0, 0))
	{
		TranslateMessage(&msg);
		DispatchMessage(&msg);
	}

	return (int)msg.wParam;
}

//  FUNCTION: WndProc(HWND, UINT, WPARAM, LPARAM)
//
//  PURPOSE:  Processes messages for the main window.
//
//  WM_DESTROY  - post a quit message and return
LRESULT CALLBACK WndProc(HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam)
{
	TCHAR greeting[] = _T("Hello, Windows desktop!");

	switch (message)
	{
	case WM_SIZE:
		if (webviewController != nullptr) {
			RECT bounds;
			GetClientRect(hWnd, &bounds);
			webviewController->put_Bounds(bounds);
		};
		break;
	case WM_CREATE:
	{
		SetProcessDPIAware();
		UINT uDpi = GetDpiForSystem();

		UINT uHeight = MulDiv(600, uDpi, 96);
		UINT uWidth = MulDiv(800, uDpi, 96);

		// // Hide the borders
		//LONG_PTR Style = GetWindowLongPtr(hWnd, GWL_STYLE);
		//Style &= ~WS_BORDER; // Remove the border
		//SetWindowLongPtr(hWnd, GWL_STYLE, Style);

		SetWindowPos(
			hWnd,
			nullptr,
			MulDiv(10, uDpi, 96),
			MulDiv(10, uDpi, 96),
			uWidth,
			uHeight,
			SWP_NOZORDER | SWP_NOACTIVATE);


		// Apply the changes
		//SetWindowPos(hWnd, NULL, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER | SWP_FRAMECHANGED);
		break;
	}

	case WM_DESTROY:
		PostQuitMessage(0);
		break;
	default:
		return DefWindowProc(hWnd, message, wParam, lParam);
		break;
	}

	return 0;
}
