;(function($){
	$(document).ready(function(){
		$('.wpepop-dismiss').on('click',function(){
			var url = new URL(location.href);
			url.searchParams.append('dismissed',1);
			location.href= url;
		});
	});
})(jQuery);