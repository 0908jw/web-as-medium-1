$(document).ready(function () {
    // Mouse enter on image: Expand follower circle and change blend mode
    $(".image").mouseenter(function () {
      $(".cursor, .follower").css({ "mix-blend-mode": "difference" });
      $(".follower-circle").addClass("follower-circle--scale");
    });
  
    // Mouse leave on image: Reset follower circle and blend mode
    $(".image").mouseleave(function () {
      $(".cursor, .follower").css({ "mix-blend-mode": "normal" });
      $(".follower-circle").removeClass("follower-circle--scale");
    });
  
    // Mouse movement: Update cursor and follower position
    $(document).on("mousemove", function (e) {
      window.requestAnimationFrame(() => {
        $(".cursor").css({
          transform: `translate3d(${e.clientX}px, ${e.clientY}px, 0px)`,
        });
        $(".follower").css({
          transform: `translate3d(${e.clientX}px, ${e.clientY}px, 0px)`,
        });
      });
    });
  });
  