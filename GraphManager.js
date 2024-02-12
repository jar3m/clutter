class GraphManager {
  constructor() {
      this.graph = new graphlib.Graph();
  }

  addNote(noteId) {
      if (!this.graph.hasNode(noteId)) {
          this.graph.setNode(noteId);
      }
  }

  connectNotes(sourceId, targetId) {
      if (!this.graph.hasEdge(sourceId, targetId)) {
          this.graph.setEdge(sourceId, targetId);
      }
  }

  removeNote(noteId) {
      // Check if the node exists before attempting to remove
      if (this.graph.hasNode(noteId)) {
          this.graph.removeNode(noteId);
      }
  }

  dfs(startNodeId, preVisitCallback, postVisitCallback) {
      let visited = {};
      const dfsVisit = (nodeId) => {
          if (visited[nodeId]) {
              return;
          }
          visited[nodeId] = true;
          if (preVisitCallback) {
              preVisitCallback(nodeId);
          }
          let successors = this.graph.successors(nodeId);
          if (successors) {
              successors.forEach(nextNodeId => dfsVisit(nextNodeId));
          }
          if (postVisitCallback) {
              postVisitCallback(nodeId);
          }
      };
  
      dfsVisit(startNodeId);
  }
  
}