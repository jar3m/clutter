let Sticky = new StickyNoteManager();
$(document).ready(function() {
  // Sticky = new StickyNoteManager();
});

let isDrawingLine = false;
let tempLineElement;

$(document).on('mousedown', '.line-start-point', function(e) {
  isDrawingLine = true;
  const startPos = $(this).offset();
  tempLineElement = createLine(startPos.left, startPos.top, e.pageX, e.pageY);
  $('#lines-container').append(tempLineElement);
  $(this).closest('.sticky-note').addClass('selected');
});

$(document).on('mousemove', function(e) {
  if (!isDrawingLine) return;
  updateLineEnd(tempLineElement, e.pageX, e.pageY); // Dynamically update line end position
});

$(document).on('mouseup', '.line-start-point', function(e) {
  if (!isDrawingLine) return;
  const endPos = $(this).offset();
  finalizeLine(tempLineElement, endPos.left, endPos.top); // Finalize line position
  $('.sticky-note.selected').removeClass('selected');
  isDrawingLine = false;
});
