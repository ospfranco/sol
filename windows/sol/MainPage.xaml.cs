#if !USE_WINUI3
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;
#else
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Controls.Primitives;
using Microsoft.UI.Xaml.Data;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Navigation;
#endif
using Windows.ApplicationModel;
using Windows.Foundation.Metadata;


// The Blank Page item template is documented at https://go.microsoft.com/fwlink/?LinkId=234238
namespace sol
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame
    /// </summary>
    public sealed partial class MainPage : Page
    {
        public MainPage()
        {
            InitializeComponent();
            var app = Application.Current as App;
            reactRootView.ReactNativeHost = app.Host;


            if (ApiInformation.IsApiContractPresent("Windows.ApplicationModel.FullTrustAppContract", 1, 0))
            {
                _ = FullTrustProcessLauncher.LaunchFullTrustProcessForCurrentAppAsync();
            }
        }
    }
}
