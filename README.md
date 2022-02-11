<h1 align="center">SOL</h1>

<h3 align="center">A Raycast/Spotlight OSS implementation</h3>

![cidemon](https://raw.githubusercontent.com/ospfranco/sol/main/assets/screenshot3.png)

<div align="center">
  <a align="center" href="https://github.com/ospfranco?tab=followers">
    <img src="https://img.shields.io/github/followers/ospfranco?label=Follow%20%40ospfranco&style=social" />
  </a>
  <br />
  <a align="center" href="https://twitter.com/ospfranco">
    <img src="https://img.shields.io/twitter/follow/ospfranco?label=Follow%20%40ospfranco&style=social" />
  </a>
</div>

<br/>

## Running this

Things that are working:

- Global Option + Space shortcut
- Floating panel, that hides/shows correctly (a la spotlight/alfred/raycast)
- (Rough) Keyboard events, basic state handling (via mobx)
- Some hardcoded code is in there for MY workflows
- App search
- Google translate
- A basic todo list implementation
- A basic calendar integration
- A basic weather API integration (hardcoded to Munich)

TBH, I won't be publishing this as product on my own, I have very little time for it nowadays, so please, feel free to fork it and create your own version, if you wanted to create a raycast/alfred product this is a great start for you, you can write most of the new logic in pure javascript, it's react-native so if you know react it shouldn't be a problem to do some cool new stuff

`yarn && npx pod-install macos && yarn mac`

In the mean time you can check out my other projects:

- [Productlane](https://productlane.io)
- [Messer](https://messerapp.cc)
- [CI Demon](https://cidemon.com)

I'll continue iterating on this on my free time but only for my own usage

## License

MIT License
