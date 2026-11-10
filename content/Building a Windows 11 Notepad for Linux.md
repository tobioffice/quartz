Windows 11 Notepad is one of the few default apps I like. It opens fast, keeps tabs, and does not ask me to create a project before I can type a sentence. I wanted that same window on Linux, as one native binary with no Electron, GTK, Qt or web view. I called the project Elevenpad and started on 2 November, in Rust with egui and eframe.

The first commit already had tabs, find and replace, CRLF handling, light and dark themes, native window drag and resize, and an AppImage script. The text area is an egui TextEdit. Around it is a title bar, tab strip, menu bar and status bar that I drew myself, because the point was to match the Windows 11 app rather than make another generic Linux editor. By the end of the next day it also had syntax highlighting, Windows 11 style open and save dialogs, and the window fixes below.

## The window chrome fought back

The editor was the easy half. The frame around it caused most of the bugs.

I wanted the rounded Windows 11 window: a transparent surface, a 1 px border, and a shadow from the compositor. eframe clears every frame with rgba(12, 12, 12, 180) by default. That dark wash sat on the surface before my panels painted, so transparency did nothing until I set the clear color to alpha zero.

The border was the next problem. I stroked a 1 px frame on the window edge, which puts half of the stroke outside the opaque fill. On X11 without a compositing manager, that half pixel showed up as a black band around the window. The stroke now sits inset by half a pixel, and rounded corners default to on only when WAYLAND_DISPLAY is set. The View menu can switch them either way.

Plain X11 needed an actual cut in the window, not just a transparent surface. src/shape.rs is about 150 lines that use the X Shape extension through x11rb. It finds the app window by _NET_WM_PID, falls back to WM_CLASS, then applies a rounded bounding region. A maximized window gets a rectangle instead. The mask updates only when the window size changes by more than a pixel, at most every 0.15 seconds, and it runs on its own thread. Windows can disappear while it walks the tree, so those errors are ignored.

The offscreen renderer could not show this one. I only saw the black corners after dragging the window into a bare X11 session.

## Vulkan lost the resize test

The renderer gave me the next bug. With wgpu on Vulkan, resizing under Wayland with an NVIDIA driver lagged behind the pointer and then jumped to the new size when I let go. The same build through glow, eframe's OpenGL backend, resized smoothly. OpenGL is now the default, --wgpu opts back into Vulkan, and a failed GL context falls back to wgpu instead of exiting. I would rather not put a renderer flag in a text editor, but the Vulkan path still lags on that driver.

Resize events also arrive coalesced, so the compositor kept stretching the last frame. The app now requests repaints for 350 ms after each size change and skips syntax tokenisation on those frames, since that is the expensive part.

Two smaller bugs came from the same morning. Hover was computed from the pointer position instead of egui's interaction layering, so the close button vanished just as the pointer reached it. And the dark palette built translucent colors with from_rgba_premultiplied and full RGB channels, which is an invalid premultiplied value: hovered menu buttons came out as solid white blobs. Switching those entries to from_rgba_unmultiplied fixed it.

## What is in 0.4.9

I tagged a release after most fixes, so the version went from 0.4.0 to 0.4.9 in one morning. The latest release has two files, an AppImage of about 6.5 MB and a tarball of about 6.1 MB. I downloaded the tarball on a headless machine and ran it:

```
$ ./elevenpad --version
Elevenpad 0.4.9
```

The help output still lists --wgpu and --gl, which is how I know the renderer switch survived packaging.

The UI can render without a window too. src/bin/shot.rs draws the app offscreen to a PNG, with flags for the dark theme, find bar, syntax highlighting, save dialog, hover positions and a resize test. I could look at the light and dark layouts without starting a compositor, which matters on a build machine with no display.

Distribution is still rough. The AppImage needs FUSE 2, or the extract and run flag, and the binary needs glibc 2.39 or newer, so an older distro has to build from source. The release is x86_64 only, and the only formats are the AppImage and the tarball. Both are on [GitHub](https://github.com/tobioffice/elevenpad).
