# Sol

![Header](Header.png)

<br/>
<div align="center">
  <a align="center" href="https://twitter.com/ospfranco">
    <img src="https://img.shields.io/twitter/follow/ospfranco?label=Follow%20%40ospfranco&style=social" />
  </a>
</div>

Sol is an open source app launcher, focused on ease of use and speed. It has minimal configuration and runs natively.

[Visit official site](https://sol.ospfranco.com)

## Download

Install via brew

```
brew install --cask sol
```

Or manually download the latest [release](https://github.com/ospfranco/sol/tree/main/releases).

## Discord

Join the Discord

https://discord.gg/W9XmqCQCKP

## Features

- App search
- Custom shortcuts
- Google translate
- Calendar
- Show upcoming appointement in Menu Bar
- Custom AppleScript commands
- Custom links
- Imports browser bookmarks
- Window Manager
- Emoji picker
- Clipboard manager
- Notes Scratchpad
- Retrieve Wi-Fi password
- Show IP address
- Start a google meet
- Switch OS theme
- Process killer
- Clear XCode Derived Data
- Generate NanoID
- Generate UUID
- Generate lorem ipsum
- Format and paste JSON
- Forward media keys to Spotify/Apple Music
- Blacken Menu Bar
- Quickly evaluate math operations

## Contributing

You need to set up your machine for macOS development with React Native. Basically you need to install:

- Mise (https://mise.jdx.dev/)
- Xcode
- Cocoapods

Follow any of the online tutorials to set up your machine for iOS/MacOS React Native development.

Once you have everything installed run the following commands

```sh
mise plugin add cocoapods
# To enable hooks
mise settings experimental=true
# Will install all bun, ruby and run the installation of dependencies
mise install

# You can then run the app with
bun macos
```

## License

MIT License
