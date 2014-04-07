$(function () {
  $("#input-form").submit(function (e) {
    var $input = $("#input");
    var input = $input.val();
    var output = 'output';
    $('<li><div class="input">' + input + '</div><div class="output">' + output + '</div></li>').insertBefore("#input-li");
    $input.val('');
    e.preventDefault();
  });
});
