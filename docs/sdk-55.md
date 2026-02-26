---
title: Expo SDK 55
authors: Alan Hughes, Brent Vatne
published: February 25, 2026
---

Today we're announcing the release of Expo SDK 55. SDK 55 includes [React Native 0.83](https://reactnative.dev/blog/2025/12/10/react-native-0.83) and [React 19.2](https://react.dev/blog/2025/10/01/react-19-2). Thank you to everyone who helped with beta testing.

## **Transition period for default projects and Expo Go**

Expo Go for the App Store and Play Store will remain on SDK 54 for a short window of time following this release, and the default project created with `npx create-expo-app` will continue to use Expo SDK 54 for consistency.

The Expo Go app is our tool for getting started quickly, it's an educational tool to help you learn to build on mobile. We encourage you to take advantage of this transition period to migrate your project to using a [development build](https://docs.expo.dev/develop/development-builds/expo-go-to-dev-build/), which provides you with everything that you need to build an app that you ship to stores.

During this period, you can install Expo Go for SDK 55 from Expo CLI directly on Android devices. For iOS, you can use the [TestFlight External Beta](https://testflight.apple.com/join/GZJxxfUU) or the new `eas go` command to create an Expo Go build for SDK 55 and upload it to your own TestFlight team. To create an SDK 55 project, use the `--template default@sdk-55` flag with `create-expo-app`.

## **Revamped default project template**

![Screenshots of the main screen of the new default template on all supported platforms](https://cdn.sanity.io/images/9r24npb8/production/6915ea37b64f63c1915f786022cad9f804802459-1800x1049.png)

The default template has been redesigned with a focus on native platform conventions and an improved project folder structure:

- **Uses the [Native Tabs API](https://docs.expo.dev/router/advanced/native-tabs/)** for a platform-native tab experience on iOS and Android, with a responsive web-optimized layout for browsers.
- **Refreshed design** for a better out-of-the-box experience.
- **New /src folder structure**, so application code now lives in **/src/app** instead of **/app**, better separating your code from project configuration files.

To use the new project template:

```console
$ # npm
$ $ npx create-expo-app@latest --template default@sdk-55
$ # bun
$ $ bun create expo-app --template default@sdk-55
$ # pnpm
$ $ pnpm create expo-app --template default@sdk-55
$ # yarn
$ $ yarn create expo-app --template default@sdk-55
```

## **Dropped support for the Legacy Architecture**

As explained in the SDK 54 release notes - “[SDK 54 is the final release to include Legacy Architecture support](https://expo.dev/changelog/sdk-54#sdk-54-is-the-final-release-to-include-legacy-architecture-support)”. In other words, you will not be able to use the Legacy Architecture in SDK 55 projects and later. Accordingly, the `newArchEnabled` config option has been removed from **app.json**. [Learn more in the “React Native’s New Architecture” guide](https://docs.expo.dev/guides/new-architecture/).

## **Hermes v1 is now available for opt-in**

Hermes v1 represents a huge step forward for the engine, showing early signs of [meaningful performance improvements across various scenarios](https://blog.swmansion.com/welcoming-the-next-generation-of-hermes-67ab5679e184), and shipping better support for [modern JavaScript features](https://x.com/Baconbrix/status/2001337091779633176?s=20) (ES6 classes, const/let syntax, async/await). You can try it out in your app with the `useHermesV1` field in [`expo-build-properties`](https://docs.expo.dev/versions/v55.0.0/sdk/build-properties/).

**It’s important to note that using Hermes v1 in Expo SDK 55 / React Native 0.83 requires building React Native from source, which significantly increases native build times**. This tradeoff might be worth it for your app.

Additionally, we do not yet recommend using it for Android in monorepo projects until [react-native-releases#1235](https://github.com/reactwg/react-native-releases/issues/1235) is resolved.

<!-- app.json -->
```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "buildReactNativeFromSource": true,
          "useHermesV1": true
        }
      ]
    ]
  }
}
```

You will need to override the `hermes-compiler` version to use the Hermes V1 compiler. Depending on your package manager, this field may be named differently. With npm, pnpm, and bun, the field is named `overrides`; for yarn, it is `resolutions`. For example:

<!-- package.json -->
```json
{
  "dependencies": {},
  "overrides": {
    "hermes-compiler": "250829098.0.4"
  }
}
```

## **Hermes bytecode diffing for EAS Update and expo-updates**

The Hermes bytecode diffing feature in `expo-updates` and [EAS Update](https://expo.dev/services#update) is an optimization that significantly reduces update download sizes for Hermes-compiled JavaScript bundles. Instead of downloading complete Hermes bytecode files for each update, the `expo-updates` client can request and apply binary patches (diffs) to the previously installed bytecode files.

This means **your updates will be downloaded more quickly by end-users**, and that **each update will use less bandwidth**. That all translates to faster update adoption rates and more updates available within the bandwidth of your EAS plan. **It’s estimated that diffs will result in an approximately 75% reduction in Hermes bytecode and JavaScript download times on both Android and iOS.**

<!-- app.json -->
```json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/[your-project-id]",
      "enableBsdiffPatchSupport": true
    }
  }
}
```

This feature is opt-in for SDK 55, and we’ll turn it on by default in SDK 56. To enable it in your project today, refer to the [`enableBsdiffPatchSupport`](https://docs.expo.dev/versions/v55.0.0/sdk/updates/) property documentation for information on the **app.json** config or iOS/Android native config options. You can confirm that bundle diffs are being served from the [Update Details](https://expo.dev/accounts/[account]/projects/[project]/updates) page. Open the Update Group you published, then select the platform you want to inspect.

![view your diffs in the update details page](https://cdn.sanity.io/images/9r24npb8/production/0db8e8678830a1fa2bb20aacf463b614b8f85efb-1558x364.png)

If you’d like to try it with your own custom updates server, refer to [this branch on expo/custom-expo-updates-server](https://github.com/expo/custom-expo-updates-server/tree/%40quin/diffs). Note that we’re prioritizing polishing up the experience with EAS Update, and we will improve the custom updates server reference at a later date.

## **Expansion of AI tooling for Expo developers**

### MCP: new tools for CLI actions and EAS services

An Expo Module can expose plugins and commands to the Expo CLI which will be made available in the `[SHIFT] + M` menu - these actions can now be automatically installed in the [Expo MCP Server](https://docs.expo.dev/eas/ai/mcp/).

Additionally, [you can now query EAS with the Expo MCP](https://expo.dev/changelog/mcp-build-and-workflows) - so you can ask questions like “why did my most recent build fail?”. You can also query TestFlight crashes and feedback (if you have your ASC key associated with your Expo account, which is used typically during EAS Submit), so you can ask your agent of choice to “investigate the most recent crash reports and feedback from testflight” and watch it work.

![Root cause analysis of TestFlight crashes with Claude Code and Expo MCP](https://cdn.sanity.io/images/9r24npb8/production/57322eeade340ad34b9adcc687f922431d7c1713-1800x1483.png)

### Agent skills

The [expo/skills](https://github.com/expo/skills) repository is the official collection of AI agent skills from the Expo team for building, deploying, and debugging robust Expo apps. We primarily use [Claude Code](https://claude.com/claude-code) at Expo and skills are fine-tuned for Opus models. But you can use these skills with any AI agent.

We have found these skills to be a great complement to the MCP, and they help Claude Code work with Expo apps better than ever before. Try them yourself and give us feedback on how we can make them even better! We also welcome pull requests!

Be sure to check out the [upgrade skills](https://github.com/expo/skills/tree/main/plugins/upgrading-expo) ([installation instructions](https://github.com/expo/skills/tree/main?tab=readme-ov-file#claude-code)), which we recommend in the [upgrading section](#upgrading-your-app) to help you with upgrading to SDK 55.

_Note_: there are a lot of “expo/skills” being created by the community, which is great! **The only skills that we currently officially endorse and plan to maintain/update are the skills you find in [our expo/skills repo](https://github.com/expo/skills).**

## **“Brownfield” (adding Expo to existing native apps)**

SDK 55 improves the support for Brownfield apps and introduces a new isolated approach to brownfield integration via the new `expo-brownfield` package. You can now choose between integrated and isolated when developing your Brownfield project.

- **Integrated**: React Native code lives inside your existing native project, ideal for teams iterating on both together.
- **Isolated**: package your React Native app as a native library (AAR/XCFramework) that native developers can consume without needing a Node.js environment.

The package includes a config plugin, CLI for building artifacts, and APIs for bi-directional messaging between your native and Expo apps. We've also improved support for packages like `expo-dev-menu` with SwiftUI support and standalone usage.

[Learn more in the Brownfield documentation](https://docs.expo.dev/versions/v55.0.0/sdk/brownfield/).

## **More native features in Expo Router**

- **New [Colors API](https://docs.expo.dev/router/reference/color/)**: add dynamic Material 3 styles to your Android app and adaptive colors on iOS.

![New dynamic Material 3 styles support](https://cdn.sanity.io/images/9r24npb8/production/2b3df7e6de4a11685a4a369bf69fecb9a7392128-1800x1050.png)

- **New Apple Zoom transition**: we’ve added support for interactive shared element transitions on iOS using the native zoom transition and gestures. This is currently an Apple-only feature, and it is enabled by default. [Learn more](https://docs.expo.dev/router/advanced/zoom-transition/).
- **New `Stack.Toolbar` API**: `UIToolbar` API for iOS apps that provides access to APIs for building menus and actions. It’s currently iOS-only, and we plan to add support for similar Android APIs in the future. [Learn more](https://docs.expo.dev/versions/v55.0.0/sdk/router/#stacktoolbar).

![New ToolBar API on iOS](https://cdn.sanity.io/images/9r24npb8/production/7cbf559fc11df909ff708a06c050062c2aca9930-1800x650.png)

- **Experimental SplitView support**: this has been something we have wanted for _ages_, and much needed in React Native. [Learn more about SplitView](https://docs.expo.dev/versions/v55.0.0/sdk/router-split-view/).
- **Experimental support for footers in form sheets on Apple platforms**: useful for adding action buttons or confirmation prompts to modal sheets. [Learn more in the API reference](https://docs.expo.dev/router/advanced/modals/#using-flex-1-with-custom-detents).
- **Default safe area handling in native-tabs layouts on both iOS and Android**: so you no longer need to manually handle safe area insets in tab layouts. [Learn more about safe area handling](https://docs.expo.dev/versions/v55.0.0/sdk/router-native-tabs/#disableautomaticcontentinsets).
- **Screen's synchronous layout updates activated by default**: reducing layout jumps during navigation transitions. [Learn more in #42154](https://github.com/expo/expo/pull/42154).
- **New default configuration for form sheet header on iOS 26+**: your form sheets will automatically adopt the Liquid Glass design language with no code changes. [Learn more in #42741](https://github.com/expo/expo/pull/42741).
- [**Xcasset icon support in native tabs**](https://github.com/expo/expo/pull/42867) and [**header items / bottom tabs**](https://github.com/expo/expo/pull/43185): you can use your Xcode asset catalog icons directly in tabs and headers, with `renderingMode` support.
- **New NativeTabs and Stack props**: added [`listeners`](https://docs.expo.dev/versions/v55.0.0/sdk/router/#listeners) and [`screenListeners`](https://docs.expo.dev/versions/v55.0.0/sdk/router/) props to NativeTabs for responding to tab events like focus and blur, [`asChild`](https://docs.expo.dev/versions/v55.0.0/sdk/router/#aschild) prop to `Stack.Screen.Title`, and [`disableTransparentOnScrollEdge`](https://docs.expo.dev/versions/v55.0.0/sdk/router-native-tabs/#disabletransparentonscrolledge) to `NativeTabs.Trigger`.
- **`react-native-screens` upgraded to 4.23.0**: bringing improved modal presentation and native screen lifecycle handling. [See the changelog](https://github.com/software-mansion/react-native-screens/releases/tag/4.23.0).

## **Expo UI**

We are working towards a stable release in mid-2026, and the improvements in SDK 55 represent a huge improvement in its capabilities already. We’ve also added skills to [expo/skills](https://github.com/expo/skills) to make it easier to get started with Expo UI for both SwiftUI and Jetpack Compose.

![A screenshot of the Settings view in the wiki-reader clone app](https://cdn.sanity.io/images/9r24npb8/production/06da45d2652ec508995f205a3ca2986621fe262a-1800x1483.png)

### Jetpack Compose

We have promoted our Jetpack Compose API from alpha to beta. As a test case for it, we created a clone of [WikiReader](https://github.com/nsh07/WikiReader) by [@nsh07](https://github.com/nsh07): [expo/wiki-reader](https://github.com/expo/wiki-reader).

- Reworked to a [functional DSL pattern](https://github.com/expo/expo/pull/40653): compose views are now defined with `View("MyView") { props -> }` instead of class-based definitions. A huge thank you to [@kimchi-developer](https://github.com/kimchi-developer) for the [incredible migration PR](https://github.com/expo/expo/pull/41622) that refactored all leaf components to the new pattern.
- Many new Material3 components ([#42734](https://github.com/expo/expo/pull/42734)): `Card`, `LazyColumn`, `ListItem`, `PullToRefreshBox`, `FlowRow`, `Surface`, `Icon`, `DockedSearchBar`, `FilterChip`, `ToggleButton`, `RadioButton`. Also added [`ModalBottomSheet`](https://github.com/expo/expo/pull/37553), [`Carousel`](https://github.com/expo/expo/pull/40325), [`IconButton`](https://github.com/expo/expo/pull/41232), and [wavy progress indicators](https://github.com/expo/expo/pull/40988). Thank you to all the external contributors who helped add these components! We don't aim to wrap every Material3 component — we added what we needed for the wiki-reader clone and will continue adding more based on demand, so let us know what you need!
- Modifiers support: apply SwiftUI-like modifiers to your Compose components. For example: `<Box modifiers={[size(100, 100), background(Color.android.dynamic.primaryContainer)]} />`. Includes scoped modifiers with Row/Column-specific modifiers ([`weight`](https://docs.expo.dev/versions/v55.0.0/sdk/ui/jetpack-compose/modifiers/#weightweight), [`matchParentSize`](https://docs.expo.dev/versions/v55.0.0/sdk/ui/jetpack-compose/modifiers/#matchparentsize)). Learn more about [`@expo/ui/jetpack-compose/modifiers`](https://docs.expo.dev/versions/v55.0.0/sdk/ui/jetpack-compose/modifiers/).
- `<Icon>` component now natively renders [Material Symbols](https://fonts.google.com/icons) XML vector drawables with tinting, sizing, and accessibility support — download icons as XML drawables and use them with `<Icon source={require('./icon.xml')} tintColor="red" size={24} />`. This aligns with the modern Android development workflow of using Material Symbols XML vector drawables. [Learn more from the Icon component](https://docs.expo.dev/versions/v55.0.0/sdk/ui/jetpack-compose/icon/).
- [`matchContents` for `Host`](https://github.com/expo/expo/pull/41553) for auto-sizing compose views, and [`Host.colorScheme`](https://github.com/expo/expo/pull/41413) for dynamic theming — equivalent to the SwiftUI `Host` API, bringing feature parity across platforms.
- [`leadingIcon`/`trailingIcon` support for Button and ContextMenu](https://github.com/expo/expo/pull/39095) and [custom button shapes](https://github.com/expo/expo/pull/40163).

[Learn more in the Jetpack Compose documentation](https://docs.expo.dev/versions/v55.0.0/sdk/ui/jetpack-compose/).

### SwiftUI

We've updated `@expo/ui` SwiftUI component APIs to more closely match SwiftUI's. If you're familiar with SwiftUI, the Expo UI equivalents should now feel more familiar. We’re still in beta, and accordingly there are a number of breaking changes:

- Breaking API renames to match SwiftUI conventions: `DateTimePicker` → [`DatePicker`](https://github.com/expo/expo/pull/41546) (now supports `range` and custom labels), `Switch` → [`Toggle`](https://github.com/expo/expo/pull/41675), `CircularProgress`/`LinearProgress` → [`ProgressView`](https://github.com/expo/expo/pull/41596). [`Section`](https://github.com/expo/expo/pull/41722), [`Form`](https://github.com/expo/expo/pull/41728), [`Button`](https://github.com/expo/expo/pull/41617), and [`Slider`](https://github.com/expo/expo/pull/41616) APIs also updated. [See the SwiftUI docs for the new APIs](https://docs.expo.dev/versions/v55.0.0/sdk/ui/swift-ui/).
- New components: [`ConfirmationDialog`](https://github.com/expo/expo/pull/43366), [`ScrollView`](https://github.com/expo/expo/pull/43162).
- New modifiers: [`contentShape()`](https://github.com/expo/expo/pull/42813) for defining tappable areas independently from visual bounds, [`monospacedDigit`](https://github.com/expo/expo/pull/43328) for stable number layouts in timers and counters, per-axis [`scaleEffect`](https://github.com/expo/expo/pull/43228) for patterns like inverted lists, and [`ignoreSafeArea`](https://github.com/expo/expo/pull/42598) for `Host`.
- [`Markdown` support in the `Text` component](https://github.com/expo/expo/pull/42448).
- [Support for custom SwiftUI views and modifiers](https://github.com/expo/expo/pull/42350): since we can't cover every SwiftUI view and modifier, we've made `expo-ui` extensible — you can create your own custom components and modifiers. [Learn more](https://docs.expo.dev/guides/expo-ui-swift-ui/extending/).

The [hot-chocolate](https://github.com/expo/hot-chocolate) showcase app has also been updated to SDK 55 and the latest Expo UI APIs. Check it out for an example of building with SwiftUI in Expo.

## **New Expo SDK package versioning scheme**

As of SDK 55, all Expo SDK packages use the same major version as the SDK. For example, the version of `expo-camera` that is compatible with SDK 55 is `^55.0.0`. This makes it easy to identify at a glance that your Expo SDK packages are in fact intended for the SDK version you are using. It also accurately reflects that we do not intend for packages to be compatible across different SDK versions.

[Video: 55 Modules, 55 CLIs, 55 Snacks, 55 Updates, 55 Builds, 55 Workflows, 55 Launches](https://www.youtube.com/shorts/Oa8s07agHeY)

## **Expo Modules Core**

Expo Modules Core is the foundation for building native modules with a modern, unified API across iOS and Android. We use it for all of our modules, and we are always investing in making it the best tool to reach for when you need to extend the native capabilities of your app. Some of the improvements in SDK 55 include:

- **Adopted Swift 6 language mode**: if you maintain native modules, your code will now be checked for data races at compile time, helping guarantee thread safety.
- **Added ArrayBuffer support**: enabling efficient binary data transfer between JavaScript and native code — useful for audio, image, and file processing. Learn more in these pull requests: [#39943](https://github.com/expo/expo/pull/39943), [#41404](https://github.com/expo/expo/pull/41404), [#41415](https://github.com/expo/expo/pull/41415), [#41548](https://github.com/expo/expo/pull/41548). Documentation coming soon.
- **Added StaticFunction and StaticAsyncFunction to Class in modules API**: allowing you to call functions on the module class itself without creating instances. Learn more in these pull requests: [#38754](https://github.com/expo/expo/pull/38754), [#39228](https://github.com/expo/expo/pull/39228).

## **Expo CLI**

- **Improved dev server startup screen**: the startup screen has been tweaked and got polished a little. It will now try not to cut off the QR code in small terminal windows, smaller QR codes will be displayed in terminals that support the new rendering mode we added ([Alacritty](https://alacritty.org/), [Ghostty](https://ghostty.org/), [Kitty](https://sw.kovidgoyal.net/kitty/), [Windows Terminal](https://github.com/microsoft/terminal)), and rendering bugs that prevent a working QR code from displaying have been fixed.
- **Environment file support via `@expo/env`**: updated to rely on Node.js’ built-in `parseEnv` support. Dotenv support shouldn’t have noticeably changed and still supports expanding environment variables.
- **Reliable first-time local network access in development builds**: we’ve added Apple Bonjour support for iOS + `expo-dev-client` in development builds in order to reliably request local network permissions before any request is made to a dev server by React Native. This works around an issue caused by a lack of a public API on iOS for requesting or querying local network access, and fixes a longstanding issue on iOS development builds where the app would hang or fail to load apps from your dev server on the first launch. We’ll continue investigating how to improve the experience on Android.
- **Dynamic app config loading**: loading of dynamic app config files, such as **app.config.js**, has been updated to align with Node.js’ support of module loading. We now experimentally allow using `.mjs`, `.cjs`, `.cts`, and `.mts` for dynamic config extensions.
- **Experimental new Log Box on native**: on web the new experience is enabled out of the box, for mobile development add `EXPO_UNSTABLE_LOG_BOX=1` and rebuild the native application. The new interface doesn’t work in Expo Go yet. Try it out and let us know your thoughts!

![New experimental Log Box UI on web, Android and iOS](https://cdn.sanity.io/images/9r24npb8/production/6124f147983a987725b305e4f4b7ac59fa8382c4-1400x800.png)

## **Alpha release of expo-widgets for iOS**

`expo-widgets` enables the creation of iOS home screen widgets and Live Activities using Expo UI components, without writing native code. It provides a shared-objects-based API for creating and updating widget timelines, starting and managing Live Activities, and listening for push-to-start tokens. Layout can be built using [`@expo/ui`](https://docs.expo.dev/versions/v55.0.0/sdk/ui/swift-ui/) components and modifiers — this is the main distinction between `expo-widgets` and [Voltra](https://www.callstack.com/blog/live-activities-and-widgets-with-react-say-hello-to-voltra). [Learn more about expo-widgets](https://docs.expo.dev/versions/v55.0.0/sdk/widgets/).

[Tweet](https://x.com/k7grzywacz/status/2000980494998175934)

## **expo-blur is now stable on Android**

Performant background blurring has been a pain point for Android developers for a long time — and that includes React Native developers targeting Android. In `expo-blur`, blurring on Android was hidden behind the [`experimentalBlurMethod`](https://docs.expo.dev/versions/v55.0.0/sdk/blur-view/#blurmethod) due to high performance cost of rendering the blur. Starting with SDK 55, `expo-blur` uses the much more efficient `RenderNode` API on Android 12 and newer. This allows developers to add background blurs to views at a low performance cost.

Support for the new blur method required us to change how the Blur API works. You will now have to specify a `<BlurTargetView>` wrapper for the blurrable background content. If you don’t want to migrate to the new API just yet and need background blurs only for previously supported platforms, you can keep your current implementation as the introduced changes are non-breaking. [Learn more](https://docs.expo.dev/versions/v55.0.0/sdk/blur-view/#basic-blurview-usage-with-android-support).

A special thanks goes out to [_Dima Saviuk_](https://github.com/Dimezis) — these changes were possible thanks to work on [Dimezis/BlurView](https://github.com/Dimezis/BlurView), which we use for blurring on Android.

## **Experimental support for receiving shared data in expo-sharing**

`expo-sharing` now provides a [highly requested](https://expo.canny.io/feature-requests/p/share-extension-ios-share-intent-android) feature out-of-the-box: first-class support for sharing data **into** Expo apps. This will be possible thanks to a config plugin, which adds a `share-extension` app target on iOS and appropriate intent-filters on Android. Sharing requests are delivered via deep links, allowing you to easily handle them in JavaScript.

Thank you, [_Maxi Ast_](https://github.com/MaxAst) for your work on [MaxAst/expo-share-extension](https://github.com/MaxAst/expo-share-extension)! If you’re looking for this feature and want to use a library that has been battle tested in production, `expo-share-extension` may be a good option for you. This feature in `expo-sharing` will be marked as experimental in SDK 55.

[Learn more about adding the ability to share content from other apps to your app](https://docs.expo.dev/versions/v55.0.0/sdk/sharing/).

## **Other Highlights**

- **Expo Go**: the UI has been completely revamped to align closely with the `expo-dev-client` changes that we made in SDK 54, and to improve the Hermes debugging experience. This work is a foundation for us to build on in upcoming cycles as we invest more in the user experience of both Expo Go and `expo-dev-client`. Let us know if we missed any details that are important to you!
- **Expo Web**: we re-wrote the error overlay, added [alpha support for server-side rendering](https://docs.expo.dev/router/web/server-rendering/), and have shipped [experimental data loaders](https://docs.expo.dev/router/web/data-loaders/).
- **`expo-contacts/next`, `expo-media-library/next`, and `expo-calendar/next`**: new object-oriented APIs for easier and more granular management of contacts, events, and media. Makes it simpler to modify data by using SharedObjects to manipulate them directly rather than passing around IDs. We’ve also added more powerful queries, among other features! Links: [Contacts](https://docs.expo.dev/versions/v55.0.0/sdk/contacts-next/), [MediaLibrary](https://docs.expo.dev/versions/v55.0.0/sdk/media-library-next/), and [Calendar](https://docs.expo.dev/versions/v55.0.0/sdk/calendar-next/).
- **`expo-notifications`**: updated to the latest Android Firebase notifications dependency. Several important fixes including [background tasks not executing](https://github.com/expo/expo/pull/43245), [crash in NotificationForwarderActivity on Android 11/12](https://github.com/expo/expo/pull/43203), [FCM intent origin validation](https://github.com/expo/expo/pull/43206), and [custom sound existence validation](https://github.com/expo/expo/pull/43189). Refer to the [breaking changes section](#notable-breaking-changes) below for more information. [Learn more in the expo-notifications API reference](https://docs.expo.dev/versions/v55.0.0/sdk/notifications/).
- **`expo-audio`**: the new version includes support for lock-screen controls, background audio recording, playlist support on all platforms ([iOS](https://github.com/expo/expo/pull/42936), [Android](https://github.com/expo/expo/pull/42937), [Web](https://github.com/expo/expo/pull/42938)), native preloading ([iOS](https://github.com/expo/expo/pull/43061), [Android](https://github.com/expo/expo/pull/43062), [Web](https://github.com/expo/expo/pull/43063)), reworked Android foreground service handling, `shouldRouteThroughEarpiece` on iOS, and expanded web support including metering, recording input selection, media controls, and audio sampling. [Learn more in the expo-audio API reference](https://docs.expo.dev/versions/v55.0.0/sdk/audio/).
- **`expo-sqlite`**: the new [SQLite Inspector DevTools Plugin](https://docs.expo.dev/versions/v55.0.0/sdk/sqlite/#browse-an-on-device-database) lets you browse and query your app's database in real time. Also added a [tagged template literals API](https://docs.expo.dev/versions/v55.0.0/sdk/sqlite/#tagged-template-literals-api) for writing type-safe, parameterized SQL queries inline — for example, `await db.sql`SELECT * FROM users WHERE age > ${age}``. Parameters are automatically bound, preventing SQL injection.

![SQLite Inspector DevTools Plugin showing a todos database with Browse Data and SQL Query tabs](https://cdn.sanity.io/images/9r24npb8/production/bc88547a2b848de6c91ef85d4df33799d83a0d61-1800x710.png)

- **`expo-crypto`**: added support for [AES-GCM encryption and decryption](https://github.com/expo/expo/pull/41249). [Learn more in the expo-crypto API reference](https://docs.expo.dev/versions/v55.0.0/sdk/crypto/).
- **`expo-camera`**: added [video stabilization mode](https://github.com/expo/expo/pull/41666) when recording, [screen flash for the front camera on Android](https://github.com/expo/expo/pull/41667), and an option to opt-out of including the barcode scanner APIs in order to reduce your app size. [Learn more in the expo-camera API reference](https://docs.expo.dev/versions/v55.0.0/sdk/camera/).
- **`expo-web-browser`**: added [auth universal links callback support](https://github.com/expo/expo/pull/42695), and fixed an Android issue where the [browser would close after the app was backgrounded](https://github.com/expo/expo/pull/41457). [Learn more in the expo-web-browser API reference](https://docs.expo.dev/versions/v55.0.0/sdk/webbrowser/).
- **`expo-video`**: added `seekTolerance` and `scrubbingModeOptions` for better scrubbing performance. Picture-in-Picture has been refactored on Android to support handling multiple `VideoView`s. Added `averageBitrate` and `peakBitrate` fields to the video track information. Audio and subtitle tracks now include `name`, `isDefault`, and `autoSelect` fields. Added `PlayerBuilderOptions` and `buttonOptions` for `VideoView` on Android. You should see performance improvements on iOS thanks to loading a larger part of the video data asynchronously. [Learn more in the expo-video API reference](https://docs.expo.dev/versions/v55.0.0/sdk/video/).
- **`expo-image`**: [supports HDR images on iOS](https://github.com/expo/expo/pull/40242), [can now render SF Symbols](https://github.com/expo/expo/pull/41907), and includes [Android cookie support](https://github.com/expo/expo/pull/43257) for authenticated image requests.
- **`expo-server`**: new package that has replaced `@expo/server` during the lifecycle of SDK 54. It exposes adapters for server runtimes and hosting providers, making it easy to deploy your Expo app's server-side code to different environments. [Learn more in the expo-server API reference](https://docs.expo.dev/versions/v55.0.0/sdk/server/).
- **`expo-file-system`**: added an [append option to write methods](https://github.com/expo/expo/pull/42778) for appending data to existing files.
- **`expo-location`**: iOS now includes [accuracy authorization in the permission response](https://github.com/expo/expo/pull/42931), letting you know whether the user granted full or reduced accuracy.
- **`expo-maps`**: added a [user interface style option for Apple Maps](https://github.com/expo/expo/pull/42199) on iOS, letting you force light or dark map appearance regardless of the system setting.
- **`create-expo-module`**: [now supports non-interactive mode](https://github.com/expo/expo/pull/43317), making it possible to scaffold new modules from AI agents and CI pipelines without requiring interactive prompts.
- **Upcoming minimum iOS version bump**: we plan to bump the minimum iOS version from 15.1 to 16.4 in SDK 56. The minimum iOS for SDK 55 is still 15.1. See the [platform version compatibility table](https://docs.expo.dev/versions/v55.0.0/#support-for-android-and-ios-versions).

## **Deprecations**

- **Deprecated `removeSubscription` functions exported from several Expo modules**: switch to `subscription.remove()`, where `subscription` is the object returned when registering an event listener.
- **`expo-video-thumbnails`**: deprecated in favor of [`generateThumbnailsAsync`](https://docs.expo.dev/versions/v55.0.0/sdk/video/#generatethumbnailsasynctimes-options) from [`expo-video`](https://docs.expo.dev/versions/v55.0.0/sdk/video/). Not receiving patches and will be removed in SDK 56.
- **`expo-video`**: deprecated track `bitrate` field in favor of `averageBitrate` and `peakBitrate`: [#41532](https://github.com/expo/expo/pull/41532).
- [**`expo-navigation-bar`**](https://docs.expo.dev/versions/v55.0.0/sdk/navigation-bar/): most methods deprecated and no-op'd now that edge-to-edge is mandatory on Android — background color, border color, behavior, position, and button style APIs no longer have any effect. The `androidNavigationBar` **app.json** config is also deprecated; use the [`expo-navigation-bar` config plugin](https://docs.expo.dev/versions/v55.0.0/sdk/navigation-bar/#configuration-in-appjsonappconfigjs) instead: [#43276](https://github.com/expo/expo/pull/43276).
- [**`expo-status-bar`**](https://docs.expo.dev/versions/v55.0.0/sdk/status-bar/): deprecated `backgroundColor`, `translucent`, and `networkActivityIndicatorVisible` props and their corresponding setter functions — these are no-ops with edge-to-edge. The `androidStatusBar.backgroundColor` and `androidStatusBar.translucent` **app.json** properties are also deprecated; use the [`expo-status-bar` config plugin](https://docs.expo.dev/versions/v55.0.0/sdk/status-bar/#configuration-in-appjsonappconfigjs) instead: [#43276](https://github.com/expo/expo/pull/43276).
- Refer to the [CHANGELOG](https://github.com/expo/expo/blob/main/CHANGELOG.md) for a full list of deprecations.

## **Notable breaking changes**

- **Following the deprecation and a warning, the `notification` configuration field was removed from the app.json schema**. Specifying a `notification` entry will throw an error in `prebuild` - migrate to the [`expo-notifications` config plugin](https://docs.expo.dev/versions/v55.0.0/sdk/notifications/#configuration).
- **Attempting to use push notifications in Expo Go on Android will throw an error.** Until now, this was a warning. We first informed about the planned removal in the [SDK 53 release post](https://expo.dev/changelog/sdk-53#deprecations--removals). To use push notifications, migrate to a development build.
- **App config evaluation toolchain changed**. **app.config.ts** files are now transpiled with your installation of TypeScript, rather than a separate internal tool. If you notice any differences to prior SDK releases, [open an issue](https://github.com/expo/expo/issues/new).
- **`expo-av` was removed from Expo Go because it has been replaced by `expo-video` and `expo-audio`.** Additionally, `expo-av` is no longer receiving patches and may not continue working in your apps as a result.
- **`expo-video`**: removed the `allowsFullscreen` prop — use `fullscreenOptions.enable` instead: [#41606](https://github.com/expo/expo/pull/41606).
- **`expo-clipboard`**: removed the deprecated `content` property from clipboard event listeners — use `getStringAsync()` instead: [#41739](https://github.com/expo/expo/pull/41739).
- **`expo-cellular`**: removed deprecated carrier-related constants; iOS methods now return `null`: [#43035](https://github.com/expo/expo/pull/43035).
- **`expo-router`**: removed deprecated `ExpoRequest` and `ExpoResponse` types from `expo-router/server` — use standard `Request`/`Response` instead: [#42363](https://github.com/expo/expo/pull/42363).
- **`edgeToEdgeEnabled` removed from app.json config**: edge-to-edge is now mandatory when targeting Android 16+. [#42518](https://github.com/expo/expo/pull/42518).
- **`expo-router`**: the `reset` prop in headless tabs has been renamed to `resetOnFocus`: [#40349](https://github.com/expo/expo/pull/40349).
- **`expo-blur`**: `experimentalBlurMethod` prop renamed to `blurMethod`: [#39996](https://github.com/expo/expo/pull/39996).
- **[`expo.experiments.autolinkingModuleResolution`](https://docs.expo.dev/modules/autolinking/#dependency-resolution-and-conflicts) is now enabled by default in monorepos**: if you're having issues with dependencies during the upgrade, we recommend trying to enable it to see if it resolves your issue. [Learn more in the "Work with monorepos" guide](https://docs.expo.dev/guides/monorepos/#deduplicating-auto-linked-native-modules).
- **The fast resolver and the `EXPO_USE_FAST_RESOLVER` have been removed**: the fast resolver was already the default — there's now just one resolver implementation, and no action is needed.
- **`experiments.reactCanary` flag removed**: React 19 is now the baseline, so the flag is no longer necessary.
- Refer to the [CHANGELOG](https://github.com/expo/expo/blob/main/CHANGELOG.md) for a full list of breaking changes.

## **Tool version bumps**

- **Minimum Xcode bumped to 26.** EAS Build uses Xcode 26.2 by default for SDK 55.
- **Minimum Node.js version increased.** Expo's Node.js version support tracks LTS versions and also aims to support the latest version. Supported versions for SDK 55 include: `^20.19.4`, `^22.13.0`, `^24.3.0`, and `^25.0.0`.

## **Upgrading your app**

Try using our [upgrade skills](https://github.com/expo/skills/tree/main/plugins/upgrading-expo) ([installation instructions](https://github.com/expo/skills/tree/main?tab=readme-ov-file#claude-code)) with Claude Code, or a similar tool of your choice, to upgrade your app.

Here's how to upgrade your app to Expo SDK 55 from 54:

- **Upgrade all dependencies to match SDK 55**:

```console
$ $ npx expo install expo@^55.0.0 --fix
```

- **Check for any possible known issues with Expo Doctor**. If you see warnings about duplicate native modules, a guide will appear to help resolve dependency update issues. To temporarily let Expo CLI work around this, enable `expo.experiments.autolinkingModuleResolution` in **app.json**. This option is enabled by default in monorepos.

```console
$ $ npx expo-doctor@latest
```

- **Refer to the ["Deprecations"](#deprecations) and ["Notable breaking changes"](#notable-breaking-changes) sections** above for breaking changes that are most likely to impact your app.
- **Make sure to check the [changelog](https://github.com/expo/expo/blob/main/CHANGELOG.md) for all other breaking changes!**
- **Upgrade Xcode if needed**: Xcode 26 is required to compile a native iOS project. For EAS Build and Workflows, profiles without any specified `image` will default to Xcode 26.2.
- **If you use [Continuous Native Generation](https://docs.expo.dev/workflow/continuous-native-generation/)**:
   - Delete the **android** and **ios** directories if you generated them for a previous SDK version in your local project directory. They'll be re-generated next time you run a build, either with `npx expo run:ios`, `npx expo prebuild`, or with EAS Build.
- **If you <u>don't</u> use [Continuous Native Generation](https://docs.expo.dev/workflow/continuous-native-generation/)**:
   - Run `npx pod-install` if you have an `ios` directory.
   - Apply any relevant changes from the [Native project upgrade helper](https://docs.expo.dev/bare/upgrade/).
   - Optionally, you could consider [adopting prebuild](https://docs.expo.dev/guides/adopting-prebuild/) for easier upgrades in the future.
- **If you use [development builds with expo-dev-client](https://docs.expo.dev/develop/development-builds/introduction/)**: Create a new development build after upgrading.
- **If you use Expo Go**: consider migrating to [development builds](https://docs.expo.dev/develop/development-builds/expo-go-to-dev-build/). [Expo Go is not recommended as a development environment for production apps](https://expo.fyi/expo-go-usage). Note that Expo Go for SDK 55 is **not yet available on stores.** You will need to install it through Expo CLI for Android or [TestFlight External Beta](https://testflight.apple.com/join/GZJxxfUU) for iOS. Alternatively, use `eas go` to create a build of Expo Go for SDK 55 and upload it to your own TestFlight team.
- **Having trouble?** Refer to the [Troubleshooting your SDK upgrade](https://expo.fyi/troubleshooting-sdk-upgrades) guide.
- **Questions?** Join our weekly office hours on Wednesdays at 12:00PM Pacific [on Discord](https://chat.expo.dev/).

## **Thanks to everyone who contributed to the release!**

**The team**, in no particular order: [everyone](https://expo.dev/about) contributed one way or another, with special mentions to the engineers most directly involved in this release: [Alan Hughes](https://github.com/alanjhughes), [Aleksander Mikucki](https://github.com/aleqsio), [Cedric van Putten](https://github.com/bycedric), [Christian Falch](https://github.com/chrfalch), [Doug Lowder](https://github.com/douglowder), [Evan Bacon](https://github.com/EvanBacon), [Gabriel Donadel](https://github.com/gabrieldonadel), [Kudo Chien](https://github.com/kudo), [Łukasz Kosmaty](https://github.com/lukmccall), [Phil Pluckthun](https://github.com/kitten), [Vojtech Novak](https://github.com/vonovak), [Wojciech Dróżdż](https://github.com/behenate), [Jakub Grzywacz](https://github.com/jakex7), [Jakub Tkacz](https://github.com/ubax), [Tomasz Sapeta](https://github.com/tsapeta), [Hassan Khan](https://github.com/hassankhan), [Krystof Woldrich](https://github.com/krystofwoldrich), [Nishan Bende](https://github.com/intergalacticspacehighway), [Aman Mittal](https://github.com/amandeepmittal), [Kadi Kraman](https://github.com/kadikraman), [Keith Kurak](https://github.com/keith-kurak), [Quin Jung](https://github.com/quinlanj), [Will Schurman](https://github.com/wschurman), [Stanisław Chmiela](https://github.com/sjchmiela), and [Wiktor Smaga](https://github.com/Wenszel). Welcome, [Bartłomiej Klocek](https://github.com/barthap), [Hubert Bernacki](https://github.com/HubertBer), and [Mathieu Acthernoene](https://github.com/zoontek)!

**External contributors**: [Abhishek Raj](https://github.com/abraj), [Aleksandr Kondrashov](https://github.com/aramikuto), [Alfonso Curbelo](https://github.com/alfonsocj), [Amaury Liet](https://github.com/AmauryLiet), [Andrej Pavlovic](https://github.com/andrejpavlovic), [Arthur Blais](https://github.com/SialB), [Artur Morys - Magiera](https://github.com/artus9033), [Azeem Idrisi](https://github.com/AzeemIdrisi), [azro352](https://github.com/azro352), [Bartosz Kaszubowski](https://github.com/Simek), [benjamin](https://github.com/benschac), [Benjamin Komen](https://github.com/benjaminkomen), [Benjamin Wallberg](https://github.com/bwallberg), [Billy](https://github.com/billysutomo), [brianomchugh](https://github.com/brianomchugh), [Błażej Kustra](https://github.com/blazejkustra), [C. Obama](https://github.com/CalvinNFT), [CamWass](https://github.com/CamWass), [Choco](https://github.com/Choco-milk-for-u), [Chris Masters](https://github.com/chrism), [Chris Zubak-Skees](https://github.com/chriszs), [Christian Wooldridge](https://github.com/cwooldridge1), [Dalibor Belic](https://github.com/daliboru), [Daniel Meyer](https://github.com/pubkey), [Daniel Reichhart](https://github.com/reichhartd), [Danish](https://github.com/danishshaik), [Dave Mkpa-Eke](https://github.com/DaveyEke), [David Alonso](https://github.com/davidalo), [Delphine Bugner](https://github.com/delphinebugner), [Dennis Morello](https://github.com/morellodev), [desii](https://github.com/desii101), [Dimitar Nestorov](https://github.com/DimitarNestorov), [Donghoon Nam](https://github.com/codenamenam), [Doğukan Yıldız](https://github.com/dogukany), [Dwight Watson](https://github.com/dwightwatson), [Dylan](https://github.com/dylancom), [Emil Lindén](https://github.com/emillinden), [Eric Kreutzer](https://github.com/erickreutz), [Eric Zeiberg](https://github.com/EricZeiberg), [Fernando Rojo](https://github.com/nandorojo), [Frank Calise](https://github.com/frankcalise), [Gary Chiu](https://github.com/garygcchiu), [Gregory Moskaliuk](https://github.com/hryhoriiK97), [Gustavo Harff](https://github.com/gustavoharff), [hssdiv](https://github.com/hssdiv), [HubertBer](https://github.com/HubertBer), [Hugo Extrat](https://github.com/huextrat), [Ian K](https://github.com/ink404), [Isaiah Hamilton](https://github.com/Isaiah-Hamilton), [Jakub Kosmydel](https://github.com/kosmydel), [Jc Cloete](https://github.com/Jc-Cloete), [Jeroen van Warmerdam](https://github.com/jerone), [JeroenG](https://github.com/Jeroen-G), [Jesper Sørensen](https://github.com/jeppester), [John HU](https://github.com/ushuz), [Jonathan Baudanza](https://github.com/jbaudanza), [Jonathan Rivera](https://github.com/jonemilnik), [Joseph Gift](https://github.com/jgmagift), [Julie Saia](https://github.com/juliesaia), [jurajpaska8](https://github.com/jurajpaska8), [K.Dileepa Thushan Peiris](https://github.com/dileepapeiris), [Kazuho Maejima](https://github.com/kzhgit), [Kfir Fitousi](https://github.com/kfirfitousi), [kimchi-developer](https://github.com/kimchi-developer), [Kornelijus Šliubauskas](https://github.com/TheAmphibianX), [Krastan Dimitrov](https://github.com/KrastanD), [Kræn Hansen](https://github.com/kraenhansen), [Kyle Ledbetter](https://github.com/kyleledbetter), [Leonardo E. Dominguez](https://github.com/focux), [leonmetthez](https://github.com/leonmetthez), [Loic CHOLLIER](https://github.com/chollier), [lucabc2000](https://github.com/lucabc2000), [Lucia Sarni](https://github.com/lsarni), [Manu](https://github.com/kamui545), [Matin Zadeh Dolatabad](https://github.com/matinzd), [Matthew Abraham](https://github.com/shottah), [Mauko Quiroga-Alvarado](https://github.com/bonjourmauko), [Maxime](https://github.com/blancham), [Mikołaj Szydłowski](https://github.com/szydlovsky), [Mohammad Amin](https://github.com/mohammadamin16), [Momtchil Momtchev](https://github.com/mmomtchev), [Myagmarsuren](https://github.com/Miigaarino), [Nicholas Pachulski](https://github.com/pachun), [Nick Ater](https://github.com/nickater), [Nicola Corti](https://github.com/cortinico), [Otávio Stasiak](https://github.com/OtavioStasiak), [Patrick Michalik](https://github.com/patrickmichalik), [Patrick Wang](https://github.com/patw0929), [Patryk Mleczek](https://github.com/pmleczek), [Peter Lazar](https://github.com/peterlazar1993), [Petr Chalupa](https://github.com/pchalupa), [Pflaumenbaum](https://github.com/Pflaumenbaum), [Preet Patel](https://github.com/preetpatel), [Randall71](https://github.com/Randall71), [Regi24](https://github.com/Regi24), [roach](https://github.com/tmdgusya), [Rodrigo Leite Araujo](https://github.com/rodrigoaraujo7), [Ronald Goedeke](https://github.com/ronickg), [Samuel Brucksch](https://github.com/SamuelBrucksch), [Samuel Newman](https://github.com/mozzius), [Santiago Topolansky](https://github.com/santitopo), [Satyajit Sahoo](https://github.com/satya164), [Sergiy Dybskiy](https://github.com/sergical), [Serhii Pustovit](https://github.com/psnet), [Shane Friedman](https://github.com/smoores-dev), [Shoghy Martinez](https://github.com/Shoghy), [Shridhar Gupta](https://github.com/sgup), [Shubh Porwal](https://github.com/shubh73), [Shubham Shinde](https://github.com/shindeshubhamm), [snowingfox](https://github.com/SnowingFox), [starsky-nev](https://github.com/starsky-nev), [teamclouday](https://github.com/teamclouday), [Terijaki](https://github.com/terijaki), [TheUntraceable](https://github.com/TheUntraceable), [ThiMal](https://github.com/tmallet), [Tomasz Zawadzki](https://github.com/tomekzaw), [Ty Rauber](https://github.com/tyrauber), [Victor Bolivar De la Cruz](https://github.com/victor-bolivar), [Vsevolod Lomovitsky](https://github.com/dwnste), [xoyseau](https://github.com/xoyseau), [yerevin](https://github.com/yerevin), and [Zhovtonizhko Dmitriy](https://github.com/doombladeoff).

**Beta testers:** [Agrit Tiwari](https://github.com/agrittiwari), [Amrit Saini](https://github.com/Amrit0991), [androidanimation](https://github.com/androidanimation), [Anthony Mittaz](https://github.com/sync), [Berhan](https://github.com/berhanserin), [Brandon Austin](https://github.com/branaust), [Chris Zubak-Skees](https://github.com/chriszs), [David Grimsley](https://github.com/DavidJGrimsley), [Dunak](https://github.com/dunak-debug), [dylanfcsr](https://github.com/dylanfcsr), [Eduardo Lomelí](https://github.com/eduardinni), [ifx326](https://github.com/tomoakikuroiwa), [Kenji Okura](https://github.com/OkuraKenG), [Kingfapa](https://github.com/Kingfapa), [Leonardo E. Dominguez](https://github.com/focux), [Lucas Hardt](https://github.com/Luc1412), [Matthew Horan](https://github.com/mhoran), [Max](https://github.com/maxvaljan), [Nikhil Reddy Avuthu](https://github.com/Nikhil1920), [R4Y](https://github.com/jonybekov), [Robrecht Meersman](https://github.com/robrechtme-itp), [Rodolfo Perottoni](https://github.com/rodperottoni), [sbkl](https://github.com/sbkl), [Simon](https://github.com/simondaigre), and [Sven](https://github.com/H-Sven).