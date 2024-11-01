// Define the ThemeToggler custom element
class ThemeToggler extends HTMLElement {
    // The connectedCallback method is called when the element is added to the DOM
    connectedCallback() {
      this.render();
    }
  
    // Render the HTML and CSS for the theme toggler
    render() {
      this.innerHTML = `
        <style>
          .theme-toggler {
            padding: 10px;
            background-color: var(--color-light, #fff); /* Fallback color for better compatibility */
            color: var(--color-dark, #000); /* Fallback color for better compatibility */
            border: none;
            cursor: pointer;
            border-radius: 5px; /* Optional: add rounded corners */
            font-size: 1rem; /* Optional: improve readability */
            transition: background-color 0.5s, color 0.5s; /* Optional: smooth transition */
          }
        </style>
        <button class="theme-toggler">Toggle Theme</button>
      `;
  
      // Add an event listener to the button to handle theme toggling
      this.querySelector("button").addEventListener("click", () => {
        // Get the current values of the theme colors
        const currentDarkColor = getComputedStyle(document.documentElement).getPropertyValue("--color-dark").trim();
        const isNight = currentDarkColor === "255, 255, 255";
  
        // Toggle the theme by changing the CSS variables
        document.documentElement.style.setProperty(
          "--color-dark",
          isNight ? "10, 10, 20" : "255, 255, 255"
        );
        document.documentElement.style.setProperty(
          "--color-light",
          isNight ? "255, 255, 255" : "10, 10, 20"
        );
      });
    }
  }
  
  // Define the custom element, making it available for use as <theme-toggler>
  customElements.define("theme-toggler", ThemeToggler);
  
