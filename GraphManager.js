class GraphManager {
    constructor() {
      this.graph = new Graph(); // Assuming Graph is your chosen library
      this.notes = {}; // Store note references
    }
  
    addNote(noteId) {
      if (!this.graph.hasNode(noteId)) {
        this.graph.addNode(noteId);
        this.notes[noteId] = { edges: [] }; // Initialize note in the registry
      }
    }
  
    connectNotes(sourceId, targetId) {
      if (this.graph.hasNode(sourceId) && this.graph.hasNode(targetId)) {
        this.graph.addEdge(sourceId, targetId);
        this.notes[sourceId].edges.push(targetId); // Keep track of the connection
        drawConnectionBetweenNotes(sourceId, targetId); 
      }
    }
    
  }
  