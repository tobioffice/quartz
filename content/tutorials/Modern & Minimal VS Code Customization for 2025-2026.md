![My 2025 VS Code setup: sleek, efficient, and tailored for clarity. Let’s build yours step by step](https://res.cloudinary.com/drm3hhsdb/image/upload/v1758544421/blog/images/dalggdvy0hwur8bxqviw.png )

> [!NOTE]
> Updated after rebuilding this setup on Arch Linux with Code - OSS. The two things that bit me are fixed below: the cursor disappearing, and the `vscode_custom_css.imports` snippet that was duplicated. Both have notes where they belong.

### ⚙️ 1. Configuring settings.json for a Clean VS Code Setup

Open the Command Palette in VS Code, press:

```bash
Ctrl + Shift + P
```

it will open the Command Palette

Then type:

```bash
settings.json
```

From the list, select: Preferences: Open User Settings (JSON)

![screen shot of command palette](https://res.cloudinary.com/drm3hhsdb/image/upload/v1758479269/blog/images/qea2amw3ncvvfg7kjin4.png)

This opens your personal configuration file, where you can fine-tune everything from themes to editor behavior.

Once you’ve opened your **settings.json** file via the Command Palette, paste the following configuration.

```json
{
  "editor.fontSize": 16.3, // 👓 Slightly larger font for better readability
  "editor.lineHeight": 20.1, // 📏 Adjusts line spacing for a more breathable layout
  "editor.padding.top": 5, // 🧘 Adds top padding to center the code visually
  "workbench.secondarySideBar.showLabels": false, // 🧭 Hides labels in the secondary sidebar for a cleaner look
  "workbench.statusBar.visible": false, // 🚫 Removes the status bar to reduce visual noise
  "terminal.integrated.tabs.hideCondition": "singleTerminal", // 🧵 Hides terminal tabs when only one is open
  "window.commandCenter": false, // 🧭 Disables the command center from the title bar
  "window.menuBarVisibility": "toggle", // 🧼 Menu bar toggles on hover — minimal until needed
  "workbench.activityBar.location": "top", // 🧩 Activity Bar on top, same as the right-click menu does
  "explorer.compactFolders": false, // 📁 Keeps folder structure expanded for clarity
  "explorer.confirmDragAndDrop": false, // 🖱️ Removes confirmation prompts for drag-and-drop
  "explorer.confirmDelete": false, // 🗑️ Removes confirmation prompts for delete actions
  "workbench.startupEditor": "none", // 🚀 Starts with an empty editor — no welcome screen
  "workbench.tips.enabled": false, // 🧠 Disables random tips on startup
  "window.zoomLevel": 0.6 // 🔍 Positive zoom: 0.6 is about +11%, so text grows, not shrinks
}
```

Two details worth knowing about that block:

- `window.zoomLevel` is **not** a scale factor. Positive values zoom in and negative values zoom out, roughly 20% per step, so `0.6` makes everything about 11% bigger. A `0.6` that means “60% size” would need to be `-1` or lower.
- Fractional `editor.fontSize` and `editor.lineHeight` are accepted. `lineHeight` is in pixels, not a multiplier, so `20.1` on a 16.3px font is a fairly tight 1.23 ratio. My eyes prefer 1.4–1.6, so try `"editor.lineHeight": 24` if this feels cramped.

Keep the file valid JSONC: comments are fine, a trailing comma is not. If the editor does not apply something, open the Command Palette and run **Preferences: Open Settings (JSON)** again — a syntax error makes VS Code silently ignore the whole file.

### 🎲 2. Let’s take it a step further by editing the actual UI using an extension

Install the **Custom CSS and JS Loader** extension. This lets you inject your own styles and scripts into VS Code — perfect for hiding unwanted elements or tweaking the interface beyond what settings.json allows.

![a screen of&nbsp;Custom CSS and JS Loader extension from extension marketplace](https://res.cloudinary.com/drm3hhsdb/image/upload/v1758480349/blog/images/x8scxv1l5btzxtw0cwqf.png)

> [!WARNING]
> If you are on **VSCodium, Code - OSS, Cursor or any other VS Code fork**, the Microsoft Marketplace is not used — those builds ship with Open VSX. `be5invis.vscode-custom-css` is not published there, so `code --install-extension` fails with “not found”. Use one of the forks instead:
>
> - `s-h-a-d-o-w.vscode-custom-css` — same extension, same `vscode_custom_css.imports` setting.
> - `subframe7536.custom-ui-style` — the one I ended up using; it also unifies the editor font and can patch webviews. Its setting is `custom-ui-style.external.imports`.
>
> ```bash
> code --install-extension subframe7536.custom-ui-style
> ```

Whichever one you pick, it works by **writing into the VS Code installation folder**, so it needs write access to the app directory:

1. Install the extension.
2. `Ctrl + Shift + P` → **Enable Custom CSS and JS** (Custom UI Style calls it **Custom UI Style: Reload**).
3. Restart VS Code. It will warn that the installation “appears corrupt” — that is the patched checksum, not damage. Choose **Don’t show again**.
4. Re-run the enable command after every VS Code update, because the installer overwrites the patched files.

On Linux the app lives in a root-owned directory (`/usr/lib/code` for the Arch package, `/usr/share/code` for the Debian one), so the extension cannot patch it as your normal user and fails with `EACCES`. Grant write access once:

```bash
sudo chown -R "$USER":"$USER" /usr/lib/code   # or /usr/share/code
```

Repeat that after each package upgrade too, for the same reason as step 4.

Now let’s create the file that will hold your custom styles.

1. Open your file explorer.

2. Navigate to:   **Documents**

3. Create a new file and name it:  **custom-code-style.css**

### 🎨 Paste This Into custom-code-style.css

Now that you’ve created your **custom-code-style.css** file, paste the following configuration into it. These styles will clean up and personalize your VS Code interface — from font smoothing to scrollbar removal and subtle UI tweaks:

```css
/* Apply custom font to all elements except codicons */
* :not(.codicon) {
  font-family: 'Dank Mono', 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', 'Source Code Pro', Menlo, Courier, monospace !important;
}

/* Center the command palette vertically */
.quick-input-widget {
  top: 25vh !important;
}

/* UI customizations */
.notification-toast,
.quick-input-widget.show-file-icons,
.editor-widget.find-widget {
  box-shadow: none !important;
}

.editor-widget.find-widget {
  border-radius: 4px;
}

.quick-input-list .scrollbar,
.monaco-action-bar.quick-input-inline-action-bar,
.monaco-scrollable-element > .shadow.top,
.monaco-editor .scroll-decoration {
  display: none;
}

.quick-input-titlebar {
  background: #100B15 !important;
}

.monaco-workbench .part.editor > .content .editor-group-container > .title.title-border-bottom:after {
  display: none;
}

.sidebar .title-label {
  padding: 0 !important;
}

.sidebar {
  border: none !important;
}

.monaco-workbench .monaco-list:not(.element-focused):focus:before,
.monaco-list-row.focused {
  outline: none !important;
}

.title.show-file-icons .label-container .monaco-icon-label.file-icon {
  justify-content: center;
  padding: 0 !important;
}

.title .monaco-icon-label:after {
  margin-right: 0;
}

.monaco-workbench .part.editor > .content .editor-group-container > .title > .label-container > .title-label {
  padding-left: 60px;
}

.title .monaco-icon-label.file-icon {
  margin: 0 35px;
}

.monaco-editor .cursors-layer .cursor {
  background-image: linear-gradient(135deg, #ffaffc 10%, #DA70D6 100%);
}

/* Safer: only affect icons in the Explorer sidebar */
.explorer-viewlet .monaco-list-rows .codicon {
  color: #ffffff3b !important;
}
```

> [!BUG]
> The original version of this post also had `.monaco-editor .cursors-layer` inside that `display: none` group, next to `.scroll-decoration`. That hides the **entire cursor layer**, so the blinking line disappears in every editor and you end up typing blind. The gradient rule lower down was never the culprit. If you copied the old snippet, delete that selector and the caret comes back — no restart needed, just reload the window once the CSS is refetched.

One more consequence of styling the cursor with a gradient: it is a `background-image`, so with `"editor.cursorStyle": "block"` you get a pink block instead of the theme colour. Drop the `.cursor` rule if you prefer the theme’s caret.

Now, open **settings.json** and add the import to the existing configuration — a single key, with the full absolute path:

```json
"vscode_custom_css.imports": [
  "file:///home/murali/Documents/custom-code-style.css"
]
```

The earlier version of this section showed two `vscode_custom_css.imports` keys (a personal example plus a placeholder). Duplicate keys in the same JSON object are invalid — the second silently wins, so copying that block meant pointing at a file that does not exist. Use one key and as many paths inside the array as you need.

Things that make the import fail quietly:

- **Relative paths do nothing.** It must be `file://` followed by an absolute path: three slashes on Linux and macOS, as above.
- **Spaces must be percent-encoded.** `file:///home/me/My Styles/custom-code-style.css` fails; `file:///home/me/My%20Styles/custom-code-style.css` works.
- **Windows paths** look like `file:///C:/Users/me/Documents/custom-code-style.css`.
- **Custom UI Style users:** the key is different and supports variables, so `"custom-ui-style.external.imports": ["file:///${userHome}/Documents/custom-code-style.css"]` works and survives a reinstall.
- After editing the CSS, the window has to reload before the change shows. A plain **Developer: Reload Window** is enough; the loader refetches the file on reload.

### 🔡 Install Dank Mono Fonts

To make your **VS Code** look exactly like mine, you’ll need to install the fonts used in the configuration:

To complete the look and feel of your customized VS Code setup, head over to the [Dank Mono GitHub repository](https://github.com/saifulapm/my-fonts/tree/main/Dank%20Mono) and download the following font files.

**[DankMono-Bold.otf](https://raw.githubusercontent.com/saifulapm/my-fonts/refs/heads/main/Dank%20Mono/DankMono-Bold.otf)** < click to download

**[DankMono-Italic.otf](https://raw.githubusercontent.com/saifulapm/my-fonts/refs/heads/main/Dank%20Mono/DankMono-Italic.otf)** < click to download

**[DankMono-Regular.otf](https://raw.githubusercontent.com/saifulapm/my-fonts/refs/heads/main/Dank%20Mono/DankMono-Regular.otf)** < click to download

Once downloaded, install each font manually by right-clicking on the file and selecting: **Install**

On Linux there is no right-click install, so drop the three files into your user font directory and rebuild the cache:

```bash
mkdir -p ~/.local/share/fonts/DankMono
# move the three .otf files into ~/.local/share/fonts/DankMono
fc-cache -f
fc-list | grep -i dank
```

You should see three lines — Regular, Italic, Bold. If `fc-list` is empty, the CSS falls back to the next font in the stack and the whole point of the setup is lost. VS Code does not need a restart for a newly installed font, but a window reload helps if the editor was already open.

### 🧼 Hide Unnecessary Elements from the Top Bar

To keep your workspace clean and distraction-free:

1. Right-click on the top bar of VS Code.

2. Untick any elements you don’t need

![image](https://res.cloudinary.com/drm3hhsdb/image/upload/v1758482361/blog/images/tmlmsltc5pyhnsusiwzm.png)

### 📐 Make the Activity Bar Compact

To streamline your workspace even further, reposition the Activity Bar:

1. Right-click anywhere on the Activity Bar.

2. Select: **Activity Bar Position → Top**

![screenshot of activity bar](https://res.cloudinary.com/drm3hhsdb/image/upload/v1758482605/blog/images/dn6ir0f6husccodjs0vk.png)

That click just writes a setting, so you can skip the mouse and put `"workbench.activityBar.location": "top"` in settings.json — it is in the block at the top of this post.

### 🧩 Final Touch: Install These Extensions

To complete your VS Code setup, head to the Extensions Marketplace and install the following:

#### One Dark Pro

![one dark pro](https://res.cloudinary.com/drm3hhsdb/image/upload/v1758482927/blog/images/dtd9v5wysy3yiv4gmgtq.png)

- Search for **One Dark Pro**

- Install it and select the “**One Dark Pro Darker**” theme for a sleek, modern look.

#### Symbols

![sumbols](https://res.cloudinary.com/drm3hhsdb/image/upload/v1758483015/blog/images/zf8le5ts32mxwh4tjknz.png)

- Search for **Symbols**

- Install and activate the icon pack to enhance file navigation with clean, expressive visuals.

#### Prettier – Code Formatter

![Prettier](https://res.cloudinary.com/drm3hhsdb/image/upload/v1758483150/blog/images/zxjf6tiuuuezntbzvwyi.png)

- Search for **Prettier**

- Install it to automatically format your code on save, keeping everything neat and consistent.

The same three choices as settings, if you would rather paste than click:

```json
"workbench.colorTheme": "One Dark Pro Darker",
"workbench.iconTheme": "symbols",
"editor.formatOnSave": true
```

`"symbols"` is the icon theme’s id, not its display name (“Symbol Icons”). A theme that is not installed yet shows up as an unknown value and VS Code falls back to the default, so install before you paste.

### 🧼 Enable Format on Save

To make Prettier work automatically, enable Format on Save in your settings:

![format on save](https://res.cloudinary.com/drm3hhsdb/image/upload/v1758483414/blog/images/q2cxpamcfgqwntkucwc4.png)

1. Open the **settings,** you can use below shortcut

```bash
Ctrl + ,
```

1. In the search bar, type: **Format On Save**

2. Check the box to enable it.

🧠 Now every time you hit save, your code gets cleaned up instantly — no extra steps, no mess.

One caveat: `"editor.formatOnSave": true` formats with the formatter a language already has selected, which is not always Prettier. If a file saves without changing, set it explicitly for that language — `"editor.defaultFormatter": "esbenp.prettier-vscode"` — or scope it: `"[typescript]": { "editor.defaultFormatter": "esbenp.prettier-vscode" }`.

### 🩹 Troubleshooting

- **The cursor is invisible.** You almost certainly copied the old stylesheet; remove `.monaco-editor .cursors-layer` from the `display: none` rule.
- **Nothing changed at all.** The CSS was never injected. Check the import path, then re-run the enable/reload command from section 2.
- **“Your Code installation appears corrupt.”** Expected after injecting CSS — it is a checksum warning for patched files. Pick **Don’t show again**.
- **The CSS stopped working after an update.** The package manager restored the original files. Re-run the enable command, and the `chown` on Linux.
- **Explorer icons are dim.** That is the `.explorer-viewlet .codicon` rule at `#ffffff3b`. Raise the alpha value to taste.
- **The status bar is gone and so are the Git branch and error counts.** That is `"workbench.statusBar.visible": false` from the very first block. `Ctrl + Shift + P` → **View: Toggle Status Bar** brings it back without editing settings.

### 🎉 That’s a Wrap!

You’ve just transformed VS Code into a sleek, focused, and personalized coding environment — from deep settings.json tweaks to custom CSS injections and handpicked extensions. This isn’t just a setup… it’s a statement.

If you found this guide helpful, follow me on **[GitHub](https://github.com/tobioffice)** and **[LinkedIn](https://www.linkedin.com/in/tobioffice/)** — I share more tips like this to help developers build intentional, distraction-free workflows.
