$(document).ready(function () {
    if ($.fn.select2) {
        $('.single-select').select2({
            minimumResultsForSearch: -1
        });
    }


    function toggleDropdown() {
        var $toggler = $('[data-dropdown-toggler]');
        var $target = $('[data-dropdown-target]');

        $toggler.click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            var attr = $(this).attr('data-dropdown-toggler');
            var target = $('[data-dropdown-target=' + attr + ']');
            var $togglers = $('[data-dropdown-toggler=' + attr + ']');
            var left = $(this).offset().left;
            var top = $(this).offset().top + $(this).outerHeight();
            var width = $(this).outerWidth();
            var w = $(window).width();

            if (attr == 'accountMenu' && w > 640) {
                return false
            }

            target.toggleClass('active');
            target.css({
                'left': left,
                'top': top,
                'width': width
            });

            $togglers.toggleClass('active');
        });

        $target.click(function (e) {
            e.stopPropagation();
            $target.removeClass('active');
        });

        $('html').click(function () {
            if ($('[data-dropdown-target].active').length > 0) {
                $target.removeClass('active');
                $toggler.removeClass('active');
            }
        });
    }

    toggleDropdown();

    function handleStoreSelect() {
        var $dropdownItem = $('.store-select-dd .dropdown-menu-item');
        var $menuItem = $('.topnav-menu-item.store-item');
        var $addrElem = $('.topnav-menu-item .store-address');

        $dropdownItem.click(function () {
            var store = $(this).attr('data-store');
            var locationString = '';

            if (store === 'hollyweed') {
                locationString = 'Los Angeles, CA';
            } else if (store === 'buds') {
                locationString = 'Studio City, CA';
            } else if (store === 'leafs') {
                locationString = 'New York, NY';
            }


            $menuItem.addClass('city-selected');
            $menuItem.find('.item-text').text($(this).text());
            $addrElem.text(locationString);

            if (store === 'all') {
                locationString = '';
                $menuItem.removeClass('city-selected');
                $menuItem.find('.item-text').text('All Stores');
            }

            $dropdownItem.removeClass('active');
            $(this).addClass('active');
        });
    }

    handleStoreSelect();

    function handleBtnTogglers() {
        var $tgl = $('.btn-toggler');

        $tgl.click(function () {
            $(this).closest('.btn-togglers').find('.btn-toggler').removeClass('active');
            $(this).toggleClass('active');
        });
    }

    handleBtnTogglers();

    function mobileLeftMenu() {
        var w = $(window).width();

        if (w <= 640) {
            var slideout = new Slideout({
                'panel': document.getElementById('mainPanel'),
                'menu': document.getElementById('leftnavMenu'),
                'padding': 150,
                'tolerance': 40
            });

            $('.mobile-bars').click(function () {
                slideout.toggle();
            });
        }
    }

    mobileLeftMenu();

    function patientViewSwitch() {
        var $controls = $('.patient-management');

        var $toggler = $('[data-switch-toggler]');
        var $target = $('[data-switch-target]');

        $toggler.click(function (e) {
            var attr = $(this).attr('data-switch-toggler');
            var target = $('[data-switch-target=' + attr + ']');

            $target.hide();
            $target.removeClass('active');
            target.show();
            target.css('top');
            target.addClass('active');

            attr == 'patients' ?
                $controls.addClass('patients-active').removeClass('groups-active')
                : $controls.addClass('groups-active').removeClass('patients-active')
        });
    }

    patientViewSwitch();

    function foo() {
        var page = window.location.pathname.replace('/', '');

        $('#leftnavMenu a').each(function () {
            if ($(this).attr('href') == page) {
                $(this).addClass('active');
            }
        });
    }

    foo();

    function toggleOverlay() {
        var $toggler = $('[data-overlay-toggler]');
        var $target = $('[data-overlay-target]');
        var $close = $('[data-overlay-close]');

        $toggler.click(function (e) {
            var attr = $(this).attr('data-overlay-toggler');
            var target = $('[data-overlay-target=' + attr + ']');

            $target.hide();
            $target.removeClass('active');
            target.show();
            target.css('top');
            target.addClass('active');

            if (attr == 'editPatient' || attr == 'editPatientGroup') {
                $toggler.closest('tr').removeClass('active');
                $(this).closest('tr').addClass('active');
            }
        });

        $close.click(function () {
            $target.removeClass('active');
            $toggler.closest('tr').removeClass('active');

            setTimeout(function () {
                $target.hide();
            }, 200);
        });
    }

    toggleOverlay();

    alert('fa')
});
