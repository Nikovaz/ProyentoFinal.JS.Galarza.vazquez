const d = document,
  ls = localStorage;

function darkTheme(btn, classDark) {
  const $themeBtn = d.querySelector(btn),
    $body = d.body;
  let moon = "🌙",
    sun = "☀️";

  $themeBtn.classList.add("dark-mode-btn"); // Agrega la clase al botón

  const lightMode = () => {
    $body.classList.remove(classDark);
    $themeBtn.textContent = moon;
    ls.setItem("theme", "light");
  };

  const darkMode = () => {
    $body.classList.add(classDark);
    $themeBtn.textContent = sun;
    ls.setItem("theme", "dark");
  };

  d.addEventListener("click", (e) => {
    if (e.target.matches(btn)) {
      if ($themeBtn.textContent === moon) {
        darkMode();
      } else {
        lightMode();
      }
    }
  });

  // Load theme from local storage
  const theme = ls.getItem("theme");
  if (theme === "dark") {
    darkMode();
  } else {
    lightMode();
  }
}

// Llama a la función con los parámetros necesarios
darkTheme("[data-dark='true']", "dark-mode");