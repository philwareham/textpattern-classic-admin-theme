(function()
{
    'use strict';

    // ScrollSpy.

    var spy = new ScrollSpy('main', {
        nav: '.design-patterns--menu ol > li > a',
        className: 'is-inview'
    });

    var subSpy = new ScrollSpy('main', {
    	nav: '.design-patterns--menu ol > li > ol > li > a',
    	className: 'is-inview'
    });

})();
