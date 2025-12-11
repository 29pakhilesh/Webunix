# WebUnix

![OS Badge](https://img.shields.io/badge/OS-WebUnix-1e90ff?style=for-the-badge&logo=react)
![Technology Badge](https://img.shields.io/badge/Technology-Pure%20JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Aesthetic Badge](https://img.shields.io/badge/Aesthetic-Minimalist%20Dark%20Mode-2C3E50?style=for-the-badge)

---

## 🚀 Project Overview

**WebUnix** is a sophisticated, browser-based Operating System (OS) environment built entirely on HTML, CSS, and pure JavaScript. Designed with a clean, minimalist, dark-mode aesthetic, WebUnix provides a functional, multi-app workspace that showcases complex web application architecture, state management, and OS emulation within a single webpage.

It features core kernel-like process management, a virtual file system (VFS), and a modern graphical user interface (GUI) crafted for speed and professionalism.

## ✨ Key Features

### 1. Architectural Integrity (Kernel & Core)

* **Process Management:** Implements kernel-level process lifecycle management (`process_manager.js`) including PIDs, spawning, and termination.
* **Window Manager (WM):** Full desktop functionality including drag-and-drop, resizing, and window focus management.
* **Virtual File System (VFS):** Persistence of file data across sessions using Local Storage, enabling file creation, editing, and deletion.
* **Secure Authentication:** User authentication based on password hashing using SHA-256 with generated salts.
* **Modern UI:** Features a minimalist taskbar with dynamic dock indicators, system tray, and a glass-morphism/blur effect (backdrop-filter).

### 2. Built-in Applications

| Application | Description | Technology Highlights |
| :--- | :--- | :--- |
| **Terminal** | A command-line interface supporting history, system commands (`ls`, `whoami`), and process execution. | Authentic command-line output styling. |
| **File Manager** | A graphical interface to browse, create, and manage files within the VFS. | Sidebar navigation and seamless integration with the Editor. |
| **Editor** | A robust text editor capable of reading and writing content back to the VFS. | Integrated save functionality and clean code-focused interface. |
| **Clock** | A utility app featuring a Main Clock, World Time zones, and visual, **analog dial** displays for both Timer and Stopwatch functions. | Dynamic CSS transforms for hand rotation and live percentage feedback. |
| **Browser** | A fully functional, tabbed web browser simulation with navigation controls and bookmarks. | Iframe-based rendering with multi-tab state management. |
| **Store** | A native-style e-commerce application featuring a curated product catalog. | Dynamic grid generation, lazy loading images, and fallback handling. |
| **Process Manager** | A graphical utility to view all running processes (PIDs) and manually terminate them. | Live process list rendering with auto-refresh. |
| **Settings** | Configuration panel for personalization (accent color, wallpaper) and system functions (user management, factory reset). | Uses CSS variables for instant runtime theme changes. |

## 🖼 Visual Showcase

The OS features a distinct dark theme, emphasizing clarity and professionalism. The UI elements demonstrate a refined, modern aesthetic:

* **Taskbar & System Tray:** Minimalist floating dock with streamlined system icons (Wi-Fi, Volume, Battery) and a dynamic horizontal volume slider with live percentage feedback.
* **Aesthetic:** The core design uses transparencies and advanced CSS effects to create a cohesive, integrated environment.

## 🛠 Tech Stack

* **Frontend:** HTML5, CSS3, ES6+ JavaScript (Pure Vanilla JS)
* **Architecture:** Modular, self-contained JavaScript files following an object-oriented pattern.
* **State Management:** Local Storage (for VFS and User Data), Session Storage (for login status).

## ⚙️ Setup and Usage

WebUnix is entirely client-side and requires no server.

1.  **Open Index:** Open the `index.html` file directly in any modern web browser (Chrome, Firefox, Safari, Edge).
2.  **Boot & Login:** The system will run a simulated boot sequence. You must create a new user account to complete the login and access the desktop.