# 💍 Wedding Invitation Parallax

A modern, elegant, and cinematic **single-page wedding invitation website** built using **HTML, CSS, and JavaScript**. This project uses a custom **scroll-driven parallax animation** to create an engaging storytelling experience where two hands gradually meet before revealing the wedding details.

Designed with smooth animations, refined typography, and a luxurious dark aesthetic, this invitation offers a memorable first impression without relying on external animation libraries.

---

## 🌐 Live Demo

```text
https://tj-paul.github.io/wedding-invitation-parallax/
```

---

## ✨ Preview

> A cinematic wedding invitation featuring:
>
> - 🤝 Animated hands that gracefully move together
> - ✨ Progressive reveal of invitation details
> - 📱 Responsive layout for desktop and mobile
> - 🎬 Scroll-controlled storytelling experience

---

## 🚀 Features

### 🎭 Scroll-Based Storytelling

Instead of immediately displaying all information, the invitation unfolds as the visitor scrolls.

The animation sequence includes:

- Hands moving together
- Hero text subtly fading upward
- "Join Us" appearing
- Wedding date reveal
- Wedding time reveal
- Couple names reveal
- Venue reveal
- Automatic transition back to normal page scrolling

This creates a premium invitation experience rather than a traditional static webpage.

---

### 🎮 Virtual Scroll Animation

Instead of relying on the browser's native scrolling during the intro sequence, the project implements a **virtual scroll system**.

This allows:

- Complete control over animation timing
- Smooth stage transitions
- Locked scrolling during the intro
- Seamless return to normal page scrolling

---

## 🛠 Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript (ES6)

No external animation frameworks were used.

---

## 📂 Project Structure

```
Wedding-Invitation-Parallax/
│
├── index.html
├── styles.css
├── script.js
│
├── images/
│   ├── bridehand.png
│   ├── groomhand.png
│   ├── groomhandcut.png
│   └── ...
│
└── README.md
```

---

### Adjust Animation Speed

Inside **script.js**:

```javascript
const TOTAL_SCROLL = 2000;
```

Increase the value for a longer animation.

Decrease it for a faster reveal.

---

### Adjust Hand Positions

Inside **script.js**:

```javascript
groomHand.style.transform = ...
brideHand.style.transform = ...
groomHandCut.style.transform = ...
```

Modify the translate values to reposition the artwork.

---

## 📄 License

This project is available for personal use and educational purposes.

If you build upon it, a star ⭐ on the repository is always appreciated.

---

## 👨‍💻 About the Developer

<h3 align="left">Turjjo Paul</h3>
<p align="left">
Computer Science & Engineering Student at <b>Bangladesh University of Engineering and Technology (BUET)</b> — Class of 2023.
</p>

- 🛠 Expertise in **Kotlin, Java, JavaScript, C, C++, and Python**
- 🧪 Experienced with **iGraphics, JavaFX**, PERN Stack, and expanding into **Data Science** (NumPy, Pandas)
- 📧 Contact: **tjpaul770@gmail.com**

<br>

<h3 align="left">Connect with me:</h3>

<p align="left">
<a href="https://linkedin.com/in/turjjo-paul" target="_blank">
<img align="center" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg" alt="linkedin" height="40" width="40"/>
</a>
<a href="https://fb.com/turjjo.paul" target="_blank">
<img align="center" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg" alt="facebook" height="40" width="40"/>
</a>
<a href="https://instagram.com/turjjo_paul" target="_blank">
<img align="center" src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="instagram" height="40" width="40"/>
</a>

</p>

---

### ⭐ If you enjoyed this project, consider giving the repository a star!
