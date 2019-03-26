$( document ).ready(function() {
  //var items = [];
  var itemsRaw = [];
  
  $.getJSON('/api/books', function(data) {
    var items =  [];
    itemsRaw = data;
    $.each(data, function(i, val) {
      items.push('<li class="bookItem" id="' + i + '">' + val.title + ' - ' + val.commentcount + ' comments</li>');
      return ( i !== 14 );
    });
    if (items.length >= 15) {
      items.push('<p>...and '+ (data.length - 15)+' more!</p>');
    }
    $('#bookList').html(items.join(''));
    /*
    $('<ul/>', {
      'class': 'listWrapper',
      html: items.join('')
      }).appendTo('#display');*/
  });
  
  var comments = [];
  $('#display').on('click','li.bookItem',function() {
    $("#detailTitle").html('<b>'+itemsRaw[this.id].title+'</b> (id: '+itemsRaw[this.id]._id+')');
    $.getJSON('/api/books/'+itemsRaw[this.id]._id, function(data) {
      comments = [];
      $.each(data.comments, function(i, val) {
        comments.push('<li>' +val+ '</li>');
      });
      comments.push('<br><form id="newCommentForm"><input style="width:300px" type="text" class="form-control" required="" id="commentToAdd" name="comment" placeholder="New Comment"></form>');
      comments.push('<br><button class="btn btn-info addComment" id="'+ data._id+'">Add Comment</button>');
      comments.push('<button class="btn btn-danger deleteBook" id="'+ data._id+'">Delete Book</button>');
      $('#detailComments').html(comments.join(''));
    });
  });
  
  $('#bookDetail').on('click','button.deleteBook',function() {
    let idind = this.id;
    $.ajax({
      url: '/api/books/'+this.id,
      type: 'delete',
      success: function(data) {
        //update list
        let ind = itemsRaw.findIndex(val => val._id === idind);
        $('#'+ ind).remove();
        $('#detailComments').empty();
        $('#detailTitle').html('<p id="detailTitle">Select a book to see it\'s details and comments</p>');
      }
    });
  });  
  
  $('#bookDetail').on('click','button.addComment',function(e) {
    e.preventDefault();
    let idind = this.id;
    var newComment = $('#commentToAdd').val();
    $.ajax({
      url: '/api/books/'+this.id,
      type: 'post',
      dataType: 'json',
      data: $('#newCommentForm').serialize(),
      success: function(data) {
        
        //adds new comment to top of list
        comments.unshift('<li>' +newComment+ '</li>'); 
       let ind = itemsRaw.findIndex(val => val._id === idind);     
        $('#detailComments').html(comments.join(''));
        $('#commentToAdd').val('');
        $('#'+ ind).text(data.title + ' - ' + data.comments.length + ' comments');
      }
    });
  });

   $('#newBookForm').submit(function(e) {
     e.preventDefault();
     $.ajax({
      url: '/api/books',
      type: 'post',
      data: $("#newBookForm").serialize(),
      success: function(data) {
        itemsRaw.unshift({_id: data._id, title: data.title, commentcount: data.comments.length});
        var items =  []; 
        $.each(itemsRaw, function(i, val) {
          items.push('<li class="bookItem" id="' + i + '">' + val.title + ' - ' + val.commentcount + ' comments</li>');
          return ( i !== 14 );
        });
        if (items.length >= 15) {
          items.push('<p>...and '+ (data.length - 15)+' more!</p>');
        }
        $('#bookList').html(items.join(''));
        $('#bookTitleToAdd').val('');
      }
    });
    
  });

  $('#deleteAllBooks').click(function() {
    $.ajax({
      url: '/api/books',
      type: 'delete',
      //dataType: 'json',  esto era el error
    //  data: $('#newBookForm').serialize(),
      success: function(data) {
        //update list
        itemsRaw = [];
        $('#bookList').empty();
        $('#detailComments').empty();
        $('#detailTitle').html('<p id="detailTitle">Select a book to see it\'s details and comments</p>');
      }
    });
  }); 
  
});