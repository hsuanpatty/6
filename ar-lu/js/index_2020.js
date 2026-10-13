$(document).ready(function() {
  $('#Bcontent1').css("display", "block");
    $('#Bcontent2').css("display", "none");
    $('#Bcontent3').css("display", "none");
  //$('.tablinksc').eq(0).addClass("active");
  // 網頁go top
$(function () {

    // 手機版：點擊展開 / 收合
    $("#menuToggle").on("click", function () {
        if ($(window).width() <= 767) {
            $(".floating-menu").toggleClass("active");
        }
    });

    // 回到頂部
    $("#gotopBtn").on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        $("html, body").stop(true, true);

        requestAnimationFrame(function () {
            $("html, body").animate({
                scrollTop: 0
            }, 500);
        });
    });

});
  // banner-slider
  $('#banner-owl-carousel').owlCarousel({
    animateOut: 'fadeOut',
    animateIn: 'fadeInRight',
    items: 1,
    nav: false,
    responsiveClass: true,
    loop: true,
    smartSpeed: 450,
    autoplay: true,
    autoplayTimeout: 5000,
    dots: true
  });

  // flatpickr設定(日曆選單)
  $(function() {
    /*declaring return datepicker*/
    var FLATPICKER_BACK = flatpickr('#flatpickrBack', {
      disableMobile: true,
      //   defaultDate: "today"
    });
    /*declaring outbound datepicker*/
    $("#flatpickrGo").flatpickr({
      minDate: "today",
      disableMobile: true,
      // defaultDate: "today",
      /* setting initial date of return picker to the one selected in 
      outbound*/
      onChange: function(dateStr, dateObj) {
        FLATPICKER_BACK.set("minDate", dateObj);
        FLATPICKER_BACK.setDate(dateObj);
      }
    });
  });

  // PopularCountry
  $(".PopularCountry-tab").simpleTab({
    defaultSkin: true,
    fadeEffect: true,
    startIndex: 0
  });

  $('.PopularCountry-owl-carousel').owlCarousel({
    nav: true,
    responsiveClass: true,
    loop: false,
    margin: 20,
    smartSpeed: 450,
    // autoHeight:true,
    dots: false,
    navText: ["<img src='https://www.artisan.com.tw/images/20_back.svg'>", "<img src='https://www.artisan.com.tw/images/20_next.svg'>"],
    responsive: {
      0: {
        items: 1
      },
      376: {
        items: 2
      },
      768: {
        items: 3
      },
      1024: {
        items: 4
      }


    }
  });

  // Taiwan
  $(".Taiwan-tab").simpleTab({
    defaultSkin: true,
    fadeEffect: true
  });

    // japanSelect
  $(".japanSelect-tab").simpleTab({
     defaultSkin: true,
    fadeEffect: true
  });

    // europestop
  $(".europetop-tab").simpleTab({
    defaultSkin: true,
    fadeEffect: true
  });

  // Europe
  $(".Europe-tab").simpleTab({
    defaultSkin: true,
    fadeEffect: true
  });

  // SpecialEvent (simpletab.js)
  $(".SpecialEvent-tab").simpleTab({
    defaultSkin: true,
    fadeEffect: true
  });

  // Asia
  $(".AsiaSelect-tab").simpleTab({
    defaultSkin: true,
    fadeEffect: true
  });

  // 超過三筆備用
  //    $('.SpecialEvent-owl-carousel').owlCarousel({
  //        nav: true,
  //        responsiveClass: true,
  //        loop: false,
  //        margin: 20,
  //        smartSpeed: 450,
  //        autoplay: false,
  //        dots: false,
  //        responsive: {
  //            0: {
  //                items: 1
  //            },
  //            576: {
  //                items: 2
  //            },
  //            769: {
  //                items: 3
  //            }
  //
  //        }
  //    });

  // Brand (simpletab.js)
  $(".Brand-tab").simpleTab({
    defaultSkin: true,
    fadeEffect: true
  });


  // AsiaSelect (easyTabs.js)
  // $(".AsiaSelect-nav-tab").tabs({
  //   type: "click",
  //   speed: 300,
  //   animation: "fade"
  // });

  // RecentlyHot {
  $('#RecentlyHot-owl-carousel').owlCarousel({
    nav: true,
    responsiveClass: true,
    loop: true,
    autoplay: true,
    autoplayTimeout: 5000,
    margin: 20,
    smartSpeed: 450,
    dots: false,
    navText: ["<img src='https://www.artisan.com.tw/images/20_back.svg'>", "<img src='https://www.artisan.com.tw/images/20_next.svg'>"],
    responsive: {
      0: {
        items: 1.4
      },
      768: {
        items: 3
      },
      1024: {
        items: 4
      }

    }
  });


  // index-link
       $('#indexLink-owl-carousel').owlCarousel({
    nav: true,
    responsiveClass: true,
    loop: false,
    margin: 20,
    smartSpeed: 450,
    //        autoplay: true,
    autoplayTimeout: 5000,
    dots: false,
    navText: ["<img src='images/20_back.svg'>", "<img src='images/20_next.svg'>"],
    responsive: {
      0: {
        items: 2
      },
      500: {
        items: 3
      },
      576: {
        items: 3,
        autoplay: false,
      },
      768: {
        items: 4,
        autoplay: false,
      },
      769: {
        items: 4
      },
      1200: {
        items: 5,
        autoplay: false,
      }

    }
  });



  // podcast menu
  // 禁止選單點選時，而馬上關閉
  $("body").on("click", ".menu_btn", function(e) {
    e.stopPropagation();
    $(".menu_btn_box").addClass("active");
  });


  $('.m_ul_inner').hide();
  $('.menu_btn_ul li').click(function() {
    $(this).children('.m_ul_inner').slideToggle();
    $(this).siblings().children('.m_ul_inner').slideUp();
    $(this).toggleClass('active');
    $(this).siblings().removeClass('active');
  });


  $(".menu_close").click(function() {
    $(".menu_btn_box").removeClass("active");
    return false;
  });


  $("body").on("click", ".platform_btn", function(e) {
    e.stopPropagation();
    $(".platform_menu_box").addClass("active");
  });

  $(document).click(function() {
    $(".menu_btn_box").removeClass("active");
  });

  $(".menu_close").click(function() {
    $(".menu_btn_box").removeClass("active");
    return false;
  });
  
});

// PopularCountry hover tabs 
// function openCity(evt, cityName) {  
//     tabcontentc = document.getElementsByClassName("tabcontentc");
//     for (i = 0; i < tabcontentc.length; i++) {
//         tabcontentc[i].style.display = "none";
//     }

//     tablinks = document.getElementsByClassName("tablinks");
//     for (i = 0; i < tablinks.length; i++) {
//       tablinks[i].className = tablinks[i].className.replace(" active", "");
//     }

//     document.getElementById(cityName).style.display = "block";
//     evt.currentTarget.className += " active";
// }

function AutoOpenTab(evt, asiaName, strtabContentd, strtablinksd, strCurrentTarget) {
  tabContentd = document.getElementsByClassName(strtabContentd);
  for (i = 0; i < tabContentd.length; i++) {
    tabContentd[i].style.display = "none";
  }

  tablinksd = document.getElementsByClassName(strtablinksd);
  for (i = 0; i < tablinksd.length; i++) {
    tablinksd[i].className = tablinksd[i].className.replace(" " + strCurrentTarget, "");
  }

  document.getElementById(asiaName).style.display = "block";
  evt.currentTarget.className += " " + strCurrentTarget;
}
