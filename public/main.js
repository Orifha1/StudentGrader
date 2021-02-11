// $('#get-button').on('click',function() {
//   // GET/READ
//       $.ajax({
//           method: "GET",
//           url: '/students',
//           contentType: 'application/json',
//           success: function(response) {       
//             var studiv = $('#listValues')
//             studiv.html('');

//             response.session.participants.forEach(function(participant){
//               studiv.append( '\
//                 <li class="list-group-item">' + participant + ' </li> \
//                 ');
//             });
//           }
//       });
// });


// $.get('/students',function(data){
//   var studiv = $('#listValues')
//   studiv.html('');
//   for(var i in data){
//     studiv.append( '\
//                 <li class="list-group-item">' + data[i].id + ' </li> \
//                 ');
//   }
// });
$('#materialUnchecked').change(function() {
  if ($('#materialUnchecked').prop('checked')) {
      $('#studentField').show();
                 
  } else {
      $('#studentField').hide();
      
  }
});
$('#materialUnchecked').change(function() {
  if ($('#materialUnchecked').prop('checked')) {
      $('#moderator').show();
      $('#studentbutton').show();
      $('#lecturer').hide();    
      $('#lectbutton').hide();          
  } else {
      $('#moderator').hide();
      $('#studentbutton').hide();
      $('#lecturer').show();
      $('#lectbutton').show(); 
  }
});
$('#materialUnchecked').change(function() {
  if ($('#materialUnchecked').prop('checked')) {
      $('#adminNumber').show();
      $('#accessNumber').hide();     
  } else {
      $('#adminNumber').hide();
      $('#accessNumber').show();
  }
});

