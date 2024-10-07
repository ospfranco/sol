using System;
using Microsoft.ReactNative.Managed;
using Windows.UI.Xaml;
using Microsoft.ReactNative;
using System.Collections.Generic;
using Windows.Foundation.Collections;

namespace SolNative
{
    [ReactModule]
    public class SolNative
    {
        public SolNative()
        {
            var app = Application.Current as sol.App;

            var keyCodes = new Dictionary<string, int>(){
                { "Enter", 36 },
                { "Escape", 53 },
                { "Up", 126 },
                { "Down", 125 },
                { "Tab", 48 },
            };

            app.Host.InstanceSettings.InstanceLoaded += (object _, InstanceLoadedEventArgs e) =>
            {
                app.frame.KeyDown += (sender, a) => {
                    var code = a.OriginalKey.ToString();
                    if (keyCodes.ContainsKey(code)) {
                        JSValueObject obj = new JSValueObject() {
                            {
                                "key",
                                code
                            },
                            {
                                "keyCode",
                                keyCodes[code]
                            }
                        };

                        KeyDown.Invoke(obj);
                    }
                };
            };
        }

        [ReactEvent("keyDown")]
        public Action<JSValueObject> KeyDown { get; set; }

        [ReactMethod("getNextEvents")]
        public void GetNextEvents(IReactPromise<string> promise)
        {
            promise.Reject(new ReactError {
                Exception = new Exception("Not implemented.")
            });
        }

        [ReactMethod("hideWindow")]
        public void HideWindow()
        {
            // Not implemented.
        }

        [ReactMethod("getApps")]
        public void GetApps(IReactPromise<string> promise)
        {
            promise.Reject(new ReactError
            {
                Exception = new Exception("Not implemented.")
            });
        }

        [ReactMethod("openFile")]
        public void OpenFile()
        {
            // Not implemented.
        }

        [ReactMethod("toggleDarkMode")]
        public void ToggleDarkMode()
        {
            ValueSet request = new ValueSet();
            request.Add("theme", null);
            _ = sol.App.Connection.SendMessageAsync(request);
        }

        [ReactMethod("executeAppleScript")]
        public void ExecuteAppleScript()
        {
            // Do nothing for now.
        }

        [ReactMethod("openWithFinder")]
        public void OpenWithFinder()
        {
            // Do nothing for now.
        }


        [ReactMethod("getMediaInfo")]
        public void GetMediaInfo(IReactPromise<string> promise)
        {
            promise.Reject(new ReactError
            {
                Exception = new Exception("Not implemented.")
            });
        }

        [ReactMethod("setGlobalShortcut")]
        public void SetGlobalShortcut(IReactPromise<string> promise)
        {
            promise.Reject(new ReactError
            {
                Exception = new Exception("Not implemented.")
            });
        }

        [ReactMethod("getCalendarAuthorizationStatus")]
        public void GetCalendarAuthorizationStatus(IReactPromise<string> promise)
        {
            promise.Reject(new ReactError
            {
                Exception = new Exception("Not implemented.")
            });
        }

        [ReactMethod("setLaunchAtLogin")]
        public void SetLaunchAtLogin()
        {
            // Do nothing for now.
        }
    }
}
