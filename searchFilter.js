class SearchFilter extends HTMLElement {
    connectedCallback() {
      this.render();
    }
  
    render() {
      const optionsJson = this.getAttribute('options');
      const defaultOption = this.getAttribute('default-option') || 'Select an option';
  
      let optionsObject;
      try {
        optionsObject = JSON.parse(optionsJson);
      } catch (error) {
        console.error('Invalid JSON provided for options:', optionsJson);
        optionsObject = {}; // Fallback to an empty object in case of JSON parse error
      }
  
      this.innerHTML = `
        <style>
          select {
            padding: 5px;
            margin: 5px;
            font-size: 1rem; /* Added font size for better readability */
          }
          /* Optional: Add more styles as needed */
        </style>
        <label for="search-filter-select">Filter options:</label>
        <select id="search-filter-select">
          <option value="any">${defaultOption}</option>
          ${Object.entries(optionsObject)
            .map(([id, name]) => `<option value="${id}">${name}</option>`)
            .join('')}
        </select>
      `;
    }
  }
  
  customElements.define("search-filter", SearchFilter);
  