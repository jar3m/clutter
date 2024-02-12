let selectedNoteId = null; // Track the first selected note for linking



function drawConnectionBetweenNotes(sourceId, targetId) {
  const source = $('#' + sourceId);
  const target = $('#' + targetId);
  const sourcePos = source.offset();
  const targetPos = target.offset();

  console.log('drawConnectionBetweenNotes', sourceId, targetId);
  const line = createLine(
    sourcePos.left + source.width() / 2, sourcePos.top + source.height() / 2,
    targetPos.left + target.width() / 2, targetPos.top + target.height() / 2
  );
  $('#lines-container').append(line);

  Sticky.connectNotes(sourceId, targetId, line); // Pass the line element
}

function createLine(x1, y1, x2, y2) {
  return $(document.createElementNS('http://www.w3.org/2000/svg','line')).attr({
    'x1': x1,
    'y1': y1,
    'x2': x2,
    'y2': y2,
    'stroke': 'black',
    'stroke-width': 2
  });
}

function handleNoteSelection(noteId) {
  if (selectedNoteId === null) {
    console.log('Here', selectedNoteId, noteId);
    selectedNoteId = noteId; // Select the first note
  } else {
    console.log('There', selectedNoteId, noteId);
    // Connect the first selected note with the second
    // graphManager.connectNotes(selectedNoteId, noteId);
    drawConnectionBetweenNotes(selectedNoteId, noteId); // Implement this
    selectedNoteId = null; // Reset selection
  }
}




class StickyNoteManager {
  constructor() {
    this.noteCounter = 0;
    this.connections = {}; // Track connections between notes
    this.initEventListeners();
  }
  generateNoteId() {
    return `note-${this.noteCounter++}`;
  }
  createStickyNoteElement(pageX, pageY) {    
  const noteId = this.generateNoteId(); // Generate a unique ID
    const note = $('<div class="sticky-note" id="' + noteId + '"></div>').css({
      left: pageX + 'px',
      top: pageY + 'px'
    });
    const content = this.createContentArea();
    const toolbar = this.createFormattingToolbar();
    const deleteButton = this.createDeleteButton(noteId)
    const lineStartPoint = this.createLineStartPoint();

    note.append(content, toolbar, lineStartPoint);; // Pass the noteId
    note.append(deleteButton);
    $('body').append(note);

    this.makeStickyNoteDraggable(note);
    // graphManager.addNote(noteId); // Register the note in the graph
    console.log('create', noteId);
    note.on('click', function(e) {
      e.stopPropagation(); // Prevent triggering body's click event
      handleNoteSelection(noteId);
    });

    return note;
  }

  createContentArea() { 
    return $('<div class="sticky-note-content" contenteditable="true"></div>');
  }
  createFormattingToolbar() { 
      const toolbar = $('<div class="formatting-toolbar"></div>');
      toolbar.append('<button class="formatting-button" data-command="bold">B</button>');
      toolbar.append('<button class="formatting-button" data-command="italic">I</button>');
      toolbar.append('<button class="formatting-button" data-command="underline">U</button>');
      toolbar.append('<button class="formatting-button" data-command="insertUnorderedList">•</button>');
      toolbar.append('<button class="formatting-button" data-command="strikeThrough">S</button>');
      toolbar.append('<button class="formatting-button" data-command="insertImage">Img</button>');
      return toolbar;    
   }
  createDeleteButton(noteId) { 
    const deleteButton = $('<button class="delete-button">X</button>');
    deleteButton.on('click', (e) => {
      e.stopPropagation(); // Prevent triggering other click events
      this.removeNoteAndConnections(noteId); // Use newly created method to handle deletion
    });
    return deleteButton;
   }

  createLineStartPoint() { /* Implementation */ }

  makeStickyNoteDraggable(note) {
    const noteId = note.attr('id');
    note.draggable({
      cancel: ".sticky-note-content", // Allows dragging except from the content area
      drag: (event, ui) => {
        this.updateLinePositions(noteId);
      }
    });
  }

  attachFormattingHandlers(note) { 
    note.find('.formatting-button').click(function() {
      const command = $(this).data('command');
    
      if (command === 'insertImage') {
      const url = prompt('Enter image URL', 'http://');
      if (url) {
          document.execCommand(command, false, url);
      }
      } else {
      document.execCommand(command, false, null);
      }
    });
   }

  appendStickyNoteToBody(note) {
    $('body').append(note);
  }
  connectNotes(sourceId, targetId, lineElement) {
    // Ensure both notes are in the connections map
    if (!this.connections[sourceId]) {
      this.connections[sourceId] = [];
    }
    if (!this.connections[targetId]) {
      this.connections[targetId] = [];
    }

    // Add the connection
    this.connections[sourceId].push({ targetId: targetId, line: lineElement });
    this.connections[targetId].push({ targetId: sourceId, line: lineElement });
  }
  
  updateLinePositions(noteId) {
    // Update positions of all lines connected to this note
    const connections = this.connections[noteId];
    if (connections) {
      connections.forEach(connection => {
        const source = $('#' + noteId);
        const target = $('#' + connection.targetId);
        const line = connection.line;

        const sourcePos = source.offset();
        const targetPos = target.offset();

        line.attr({
          'x1': sourcePos.left + source.width() / 2,
          'y1': sourcePos.top + source.height() / 2,
          'x2': targetPos.left + target.width() / 2,
          'y2': targetPos.top + target.height() / 2
        });
      });
    }
  }
  removeNoteAndConnections(noteId) {
    // Remove lines connected to this note
    if (this.connections[noteId]) {
      this.connections[noteId].forEach(connection => {
        connection.line.remove(); // Remove the SVG line element
      });
      delete this.connections[noteId]; // Remove the note from the connections tracking
    }
  
    // Also need to remove this note as a target from other notes' connections
    Object.keys(this.connections).forEach(sourceId => {
      this.connections[sourceId] = this.connections[sourceId].filter(connection => {
        if (connection.targetId === noteId) {
          connection.line.remove(); // Remove the SVG line element
          return false; // Remove this connection from the array
        }
        return true;
      });
    });
  
    // Remove the note element from the DOM
    $('#' + noteId).remove();
  }
  initEventListeners() {
    $(document).on('click', (event) => { 
      if (!$(event.target).closest('.sticky-note, .formatting-button').length) {
        // Correctly reference methods with `this`
        const note = this.createStickyNoteElement(event.pageX, event.pageY);
        this.appendStickyNoteToBody(note); // This method was directly calling `appendStickyNoteToBody`. It's now corrected.
        this.attachFormattingHandlers(note); // Same here, corrected to use `this`
        note.find('.sticky-note-content').focus();
      }
    });
  }
    
}
