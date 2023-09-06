using System.Diagnostics;
using Microsoft.Win32;
using Windows.ApplicationModel.AppService;
using Windows.ApplicationModel;
using System;
using System.Threading;

namespace ConsoleApp
{
    class Program
    {

        static void Main(string[] args)
        {
            InitializeAppServiceConnection();

            // I am sure that this is not the right way to keep the app open...
            new ManualResetEvent(false).WaitOne();
        }

        /// <summary>
        /// Open connection to UWP app service
        /// </summary>
        public static async void InitializeAppServiceConnection()
        {
            AppServiceConnection connection = new AppServiceConnection();
            connection.AppServiceName = "InteropService";
            connection.PackageFamilyName = Package.Current.Id.FamilyName;
            connection.RequestReceived += Connection_RequestReceived;
            await connection.OpenAsync();
        }

        /// <summary>
        /// Handles the event when the desktop process receives a request from the UWP app
        /// </summary>
        private static void Connection_RequestReceived(AppServiceConnection sender, AppServiceRequestReceivedEventArgs args)
        {
            if (args.Request.Message.ContainsKey("theme"))
            {
                toggleTheme();
            }
        }

        /// <summary>
        /// Toggle current system theme
        /// </summary>
        private static void toggleTheme()
        {
            RegistryKey registry = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Themes\Personalize", true);
            Debug.WriteLine("toggle Theme", registry.GetValue("AppsUseLightTheme"));

            if (registry.GetValue("AppsUseLightTheme").Equals(0))
            {
                registry.SetValue("AppsUseLightTheme", 1, RegistryValueKind.DWord);
            }
            else
            {
                registry.SetValue("AppsUseLightTheme", 0, RegistryValueKind.DWord);
            }
        }
    }
}
