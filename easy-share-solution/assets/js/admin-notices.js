jQuery(document).ready(function($) {
    // Handle notice dismissal for both dismiss button and maybe later button
    $(document).on("click", ".ess-dismiss-notice, .ess-maybe-later", function(e) {
        e.preventDefault();
        
        const $notice = $(this).closest(".ess-notice");
        const noticeKey = $notice.data("notice");
        const nonce = $notice.data("nonce");
        
        if (!noticeKey || !nonce) {
            alert("Error: Missing notice data. Please refresh the page and try again.");
            return;
        }
        
        // Add loading state
        $notice.css("opacity", "0.6");
        $(this).prop("disabled", true);
        
        $.ajax({
            url: ajaxurl,
            type: "POST",
            data: {
                action: "ess_dismiss_notice",
                notice: noticeKey,
                nonce: nonce
            },
            success: function(response) {
                if (response.success) {
                    $notice.fadeOut(300, function() {
                        $(this).remove();
                    });
                } else {
                    alert("Failed to dismiss notice. Please try again.");
                    $notice.css("opacity", "1");
                    $notice.find("button").prop("disabled", false);
                }
            },
            error: function(xhr, status, error) {
                console.error("AJAX Error:", status, error);
                alert("Error dismissing notice. Please try again.");
                $notice.css("opacity", "1");
                $notice.find("button").prop("disabled", false);
            }
        });
    });
    
    // Add pulse animation to Pro button
    setInterval(function() {
        $(".ess-pro-button").addClass("pulse");
        setTimeout(function() {
            $(".ess-pro-button").removeClass("pulse");
        }, 1000);
    }, 5000);
});
