// 會員登入
$(function () {
  var $modal = $('.modal');
  var HIDE_CLASS = 'is-hide';
  
  $('.js-startbtn').on('click',function(){
    $modal.removeClass(HIDE_CLASS);
  });
  
  $('.js-modal-close').on('click',function(){
    $modal.addClass(HIDE_CLASS);
  });
});

// 忘記密碼
$(function () {
  var $modal = $('.modal');
  var HIDE_CLASS = 'is-hide';

  $('.forget_btn').on('click', function () {
    $('.modal_B').removeClass(HIDE_CLASS);
    $modal.addClass(HIDE_CLASS);
  });

  $('.js-modal-close').on('click', function () {
    $('.modal_B').addClass(HIDE_CLASS);
  });
});