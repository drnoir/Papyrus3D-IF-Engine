AFRAME.registerComponent('dialogue', {
    init: function () {
      this.currentId = 1;
      this.loadDialogue();
    },
    loadDialogue: function () {
      fetch('dialogue.json')
        .then(response => response.json())
        .then(dialogue => this.displayMessage(dialogue.find(item => item.id === this.currentId)));
    },
    displayMessage: function (messageData) {
      const messageElement = document.getElementById('message');
      const optionsElement = document.getElementById('options');
      const optionsContainer = document.createElement('a-entity');
  
      messageElement.setAttribute('value', messageData.message);
  
      optionsElement.setAttribute('visible', false);
  
      if (messageData.options) {
        messageData.options.forEach(option => {
          const optionEntity = document.createElement('a-text');
          optionEntity.setAttribute('value', option.text);
          optionEntity.setAttribute('color', 'blue');
          optionEntity.setAttribute('clickable', '');
          optionEntity.setAttribute('next-id', option.nextId);
          optionsContainer.appendChild(optionEntity);
        });
        optionsElement.appendChild(optionsContainer);
        optionsElement.setAttribute('visible', true);
      } else {
        optionsElement.setAttribute('visible', false);
      }
    }
  });
  
  AFRAME.registerComponent('clickableChar', {
    init: function () {
      this.el.addEventListener('click', this.onClick.bind(this));
    },
    onClick: function () {
      const nextId = this.el.getAttribute('next-id');
      if (nextId !== null) {
        this.el.sceneEl.components.dialogue.currentId = nextId;
        this.el.sceneEl.components.dialogue.loadDialogue();
      }
    }
  });