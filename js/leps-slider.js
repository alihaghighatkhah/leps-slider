'use strict';
/**
 * otobox - Simple and fast JavaScript/HTML5 library to create autocomplete inputs
 *
 * Afshin Mehrabani [@afshinmeh]
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else {
    // Browser globals
    root.lepsSlider = factory();
  }
}(this, function () {

  /**
   * To init basic settings and variables
   */
  function _init (config) {
    /**
     * Default options
     */
    var defaults = {
      /* value key */
      wrapper: '#lep-slider',
      animation: "fade",              // {string} - fade or slide
      easing: "ease",                 // {string} - Determines the easing method used in transitions. cubic buizier for example
      direction: 'ltr',               // {string} - rtl or ltr. defines the dirction of accending slide
      animationLoop: true,            // {boolean} - defines if animation will start from 1st slide after finished in last slide
      autoSlide: true,                // {boolean} - slide automatically or manually. if false, at least 1 navigator menu shold be present
      animationSpeed: 600,            // {number} - animation duration of each slide
      initDelay: 0,                   // {number} - delay of starting first slideShow in miliseconds
      slideDelay: 0,                  // {number} - delay of animation of each slide in milisecond
      randomize: false,               // {boolean}: Randomize slide order

      // Usability features
      pauseOnHover: false,            // {boolean} - pause slide show while oiinter is inside slider

      // Primary Controls
      indicatorsNav: true,            // {boolean} - Create navigation for paging control of each clide? Note: Leave true for manualControls usage
      indicatorsNavContainer: "",     // {string|array} - Custom css class name(s) to be added to Navigation menu, could be array or space separated string of names
      directivesNav: true,            // {boolean} - Create navigation for previous/next navigation? (true/false)
      directivesContainer: "",        // {string|array} - Custom css class name(s) to be added to Navigation menu, could be array or space separated string of names
      pasueButton: true,              // {boolean} - Show pause button
      prevText: "Prev",               // {string} - Set the text for the "previous" directionNav item
      nextText: "Next",               // {string} - Set the text for the "next" directionNav item

      // Maual navigation
      keyboard: true,                 // {boolean} - Allow slider navigating via keyboard left/right keys

      // Carousel Options
      itemWidth: 0,                   // {nteger} - Box-model width of individual carousel items, including horizontal borders and padding.
      itemMargin: 0,                  // {nteger} - Margin between carousel items.
      minItems: 0,                    // {nteger} - Minimum number of carousel items that should be visible. Items will resize fluidly when below this.
      maxItems: 0,                    // {nteger} - Maxmimum number of carousel items that should be visible. Items will resize fluidly when above this limit.
      currentSlide: 0
    };

    this._options = _merge(defaults, config);

    // construct intial HTML structure
    _construct.call(this);
  };// end of init

  /**
   * @name merge
   * @summary merges two given objects and returned the result
   *
   **/
  function _merge (obj1, obj2) {
    var obj = {};

    for (var x1 in obj1) {
      if (obj1.hasOwnProperty(x1)) {
        obj[x1] = obj1[x1];
      }
    }

    for (var x2 in obj2) {
      if (obj2.hasOwnProperty(x2) && x2 != '$attr' && x2 != '$$element') {
        obj[x2] = obj2[x2];
      }
    }
    return obj;
  };

  /**
   * @name trim
   * @summary removes non blank spaces from both sides of string
   *
   **/
  function _trim (str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  }

  /**
   * @name hasClass
   * @summary checks if given elemen has the given className
   *
   **/
  function _hasClass (element, className) {
    if (element != undefined && element.className) {
      return element.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
    } else {
      return false;
    }
  }

  /**
   * @name addClass
   * @summary adds given className to given element
   *
   **/
  function _addClass (element, className) {
    if (element != undefined && !_hasClass(element, className)) {
      element.className += " " + className;
      element.className = _trim(element.className);
    }
  }

  /**
   * @name removeClass
   * @summary removes given className from given element
   *
   **/
  function _removeClass (element, className) {
    if (element != undefined) {
      if (_hasClass(element, className)) {
          var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
          element.className = element.className.replace(reg, ' ');
      }
      element.className = _trim(element.className);
    }
  }

  /**
   * @name construct
   * @summary creates intial html structure of slider
   * @param config {object} - options of slider
   **/
  function _construct (config) {
    this.wrapperElement = document.querySelector(this._options.wrapper);
    if (this.wrapperElement == undefined) {
      _error('Wrapper element is mandatory for slider, define it in config or use #lep-slider');
    }

    // adding css class
    _addClass(this.wrapperElement, 'lep-slider-wrapper');
    // defining transision according to optons
    this.wrapperElement.setAttribute('style', 'transition: transform ' + this._options.easing + ' '  + this._options.animationSpeed + 'ms;' +
                                              '-webkit-transition: transform ' + this._options.easing + ' '  + this._options.animationSpeed + 'ms;' +
                                              '-moz-transition: transform ' + this._options.easing + ' '  + this._options.animationSpeed + 'ms;' +
                                              '-ms-transition: transform ' + this._options.easing + ' '  + this._options.animationSpeed + 'ms;');

    var slideElements = (this._options.slide) ? this.wrapperElement.querySelectorAll(this._options.slide) : this.wrapperElement.children;

    // create a container element, this is what we are to move it inside wrapper
    this.slidesContainer = document.createElement('div');
    this.slidesContainer.className = 'slides-container';
    this.wrapperElement.appendChild(this.slidesContainer);

    // append children to container
    // wrapping elemnts by reference prvents loosing listeners already bound to elements
    var length = slideElements.length;
    this._options.slideWidth = 100 / length;
    for (var i = 0; i < length; i++) {
      if (slideElements[0] != this.slidesContainer && slideElements[0] != undefined) {
        _addClass(slideElements[0], 'slide-item');
        slideElements[0].style.width = this._options.slideWidth + '%';
        this.slidesContainer.appendChild(slideElements[0]);
      }
    }

    this.slideElements = this.slidesContainer.children;

    // setting with of items manually
    this.slidesContainer.style.width = (100 * length) + '%';

    // adding navigators if permitted in options
    if (this._options.indicatorsNav) {
      _addIndicatorsNav.call(this);
    }

    // adding navigators if permitted in options
    if (this._options.directivesNav) {
      _addDirectives.call(this);
    }


  }

  /**
   * @name hasCssFeature
   * @summary checks if current browser supports given feature or not
   * thanks to [Daniel](http://stackoverflow.com/users/389410/daniel)
   * @param config {object} - options of slider
   **/
   function _hasCssFeature(featurename) {
    var feature = false,
    domPrefixes = 'Webkit Moz ms O'.split(' '),
    elm = document.createElement('div'),
    featurenameCapital = null;

    featurename = featurename.toLowerCase();

    if( elm.style[featurename] !== undefined ) { feature = true; } 

    if( feature === false ) {
      featurenameCapital = featurename.charAt(0).toUpperCase() + featurename.substr(1);
      for( var i = 0; i < domPrefixes.length; i++ ) {
        if( elm.style[domPrefixes[i] + featurenameCapital ] !== undefined ) {
          feature = true;
          break;
        }
      }
    }
    return feature; 
  }

  /**
   * @name _previous
   * @summary navigate to previous slide
   *
   **/
  function _previous () {
    _goTo.call(this, this._options.currentSlide - 1)
  }

  /**
   * @name _next
   * @summary navigate to next slide
   *
   **/
  function _next () {
    _goTo.call(this, this._options.currentSlide + 1)
  }

  function _activateIndicator (index) {
    for (var i = 0; i < this._options.indicatorsNavEl.children.length; i++) {
      _removeClass(this._options.indicatorsNavEl.children[i], 'active');
    }
    _addClass(this._options.indicatorsNavEl.children[index], 'active')

  }


  /**
   * @name _goTo
   * @summary navigate to given slide number
   * this will navigate to last slide if index is greater than slide numbers
   * and also to first slide if index is zero
   * @param index {number} - the index of target slide in the slidesContainer
   **/
  function _goTo (index) {
    _activateIndicator.call(this, index);
    // normilizing index
    // @todo check loop or one directional
    if (index >= this.slideElements.length) {
      _warn('Provided index greater than number of existing slides. navigating to last slide instead.');
      index = this.slideElements.length - 1;
    } else if (index < 0) {
      _warn('Provided a negative index. navigating to first slide instead.');
      index = 0;
    }

    this._options.currentSlide = index;

    // navigating
    // checking if browser supports transtion otherwise use left property with JS animation
    if (_hasCssFeature('transition')) {
      //@todo add fade animation
      this.slidesContainer.setAttribute('style', 'width: '+ this.slidesContainer.style.width +
                                                  ';transform: translateX(-' + index * this._options.slideWidth + '%);' + 
                                                  '-webkit-transform: translateX(-' + index * this._options.slideWidth + '%);' + 
                                                  '-moz-transform: translateX(-' + index * this._options.slideWidth + '%);' + 
                                                  '-ms-transform: translateX(-' + index * this._options.slideWidth + '%;)');
    // using JS animation
    // for cases not supporting transition
    } else {
      //@todo add JS fallback
    }


  }

  /**
   * @name _addBulletsNav
   * @summary navigate to given slide number
   * this will navigate to last slide if index is greater than slide numbers
   * and also to first slide if index is zero
   * @param index {number} - the index of target slide in the slidesContainer
   **/
  function _addIndicatorsNav () {


    // generating navigators menu
    this._options.indicatorsNavEl = document.createElement('ul');
    var link = null;

    // normalizing class name
    if (typeof this._options.indicatorsNavContainer == 'string') {
      this._options.indicatorsNavContainer = this._options.indicatorsNavContainer.split(' ')
    }

    // static class name to work with default css stylesheet
    this._options.indicatorsNavContainer.unshift('leps-navigator');
    this._options.indicatorsNavEl.className = this._options.indicatorsNavContainer.join(' ').trim();

    // appending points to navigator
    for (var i = 0; i < this.slideElements.length; i++) {
      //creating each indicator
      var point = document.createElement('li');
      link = document.createElement('a');
      link.setAttribute('data-index', i);

      // activate intiating indicator
      if (this._options.currentSlide == i) {
        _addClass(point, 'active')
      }

      var self = this;
      link.onclick = function (e) {
        var index = e.target.getAttribute('data-index');
        self.goTo(index);
      }
      //@todo add text content as: index of there are no titles for slides
      point.appendChild(link);
      this._options.indicatorsNavEl.appendChild(point);
    }

    // appending navigators menu to slider rapper
    this.wrapperElement.appendChild(this._options.indicatorsNavEl);

  }


  /**
   * @name _addDirectives
   * @summary pext / prev buttons
   * @param index {number} - the index of target slide in the slidesContainer
   **/
  function _addDirectives () {

    // generating navigators menu
    var navigators = document.createElement('nav');
    var navigatorsContainer = document.createElement('ul');

    // normalizing class name
    if (typeof this._options.directivesContainer == 'string') {
      this._options.directivesContainer = this._options.directivesContainer.split(' ')
    }
    // static class name to work with default css stylesheet
    this._options.directivesContainer.unshift('leps-directives');
    navigators.className = this._options.directivesContainer.join(' ').trim();

    navigators.appendChild(navigatorsContainer);

    // appending points to navigator
    var point = document.createElement('li');
    point.className = 'leps-next';
    var link = document.createElement('a');
    link.textContent = this._options.nextText;
    var self = this;
    link.onclick = function () {
      self.next();
    }
    point.appendChild(link);
    navigatorsContainer.appendChild(point);

    point = document.createElement('li');
    point.className = 'leps-prev';
    link = document.createElement('a');
    link.onclick = function () {
      self.previous();
    }
    link.textContent = this._options.prevText;
    point.appendChild(link);
    navigatorsContainer.appendChild(point);

    // appending navigators menu to slider rapper
    this.wrapperElement.appendChild(navigators);

  }



  // startSlideshow
  // stopSlideshow
  // push slide


  /**
   * @name error
   * @summary throws error
   *
   **/
  function _error (msg) {
    throw new Error('leps sldier - ' + msg);
  };

  /**
   * @name warn
   * @summary loggs a warn in console
   *
   **/
  function _warn (msg) {
    console.warn('leps sldier - ' + msg);
  };





  /* constructor */
  var lepsSlider = function (config) {
    _init.call(this, config);
  };

  lepsSlider.prototype = {
    setOption: function (option, value) {
      // @todo check options to be valid
      this._options[option] = value;
      return this;
    },
    setOptions: function (options) {
      if (typeof options != 'object' || options == undefined) {
        _warn('No options provided');
        return false;
      } else {
        this._options = _merge(this._options, options);
        return this;
      }
    },
    previous: function () {
      _previous.call(this);
      return this;
    },
    next: function () {
      _next.call(this);
      return this;
    },
    goTo: function (index) {
      _goTo.call(this, index);
      return this;
    }
  };

  return lepsSlider;
}));