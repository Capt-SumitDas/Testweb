(function($) { // jQuery must be included before this file.
	/**
	 * Scroll navigation pane to specified element and highlight it.
     * @param $nav - jQuery objecet for $('nav') pane.
     * @return this - for chaining
	 */
   $.fn.highlightAndGoTo = function($nav) {
        var $this = $(this);

        $('a', $nav).removeClass('active');
        $('li.module-title', $nav).removeClass('open');
        $this.addClass('active');
        $this.closest('li.module-title').addClass('open');
        $(this)[0].closest('li.module-title').scrollIntoView();

		return this;
	};

    $.fn.extend({
    toggleText: function(a, b){
        return this.text(this.text() == b ? a : b);
        }
    });

    //Remember User preferences on video reload
    if (typeof (localStorage) == 'undefined') {
        document.getElementById("result").innerHTML =
    'Your browser does not support HTML5 localStorage. Try upgrading.';
    } else {
        if (localStorage.getItem("pref") != null) {
            getPref = localStorage.pref;
            $("body").addClass('dark-mode');
            $('a.mode').text('Light Mode');
        }
    }
    $(document).ready(function () {
        $('a.mode').on('click', function () {
            getPref = localStorage.pref;
            $("body").toggleClass('dark-mode');
            $('a.mode').toggleText('Dark Mode', 'Light Mode');
            if ($("body").hasClass('dark-mode')) {
            localStorage.setItem('pref', 'dark-mode');


        }else{
            localStorage.removeItem('pref');
        }

        });
    });

    if (typeof (localStorage) == 'undefined') {
        document.getElementById("result").innerHTML =
    'Your browser does not support HTML5 localStorage. Try upgrading.';
    } else {
        if (localStorage.getItem("menu") != null) {
            getMenu = localStorage.menu;
            $("a.menu-toggle").addClass('closed');
            $('.nav-tray').addClass('closed');
            //$('.video-tray').addClass('medium-9');
        }
    }
    $(document).ready(function () {
        $('a.menu-toggle').on('click', function () {
            getMenu = localStorage.menu;
            $(this).toggleClass('closed');
            $('.nav-tray').toggleClass('closed');
            //$('.video-tray').toggleClass('medium-11');
            if ($("a.menu-toggle").hasClass('closed')) {
            localStorage.setItem('menu', 'closed');

        }else{
            localStorage.removeItem('menu');
        }

        });
    });
    $( "#nav" ).on("click","li.module-title", function(event) {    
       $('.module-title').removeClass('open');
       $(this).addClass('open');
    });
$(document).ready(function () {
    if($('ul.submenu').is(':empty')) {
        $(this)[0].closest('li.module-title').addClass('single');
    }
});


    function PWK() {
        //
        // "private"
        //
        var tags = {}; // will hold search tags
        var options = {};
        var REVISIT_TIME_OFFSET = 10; // seconds to rewind playhead when returning to a bookmarked module.

        /**
         * Tag/Keyword search engine.
         */
        var substringMatcher = function(tags) {
            return function findMatches(q, cb) {
                var matches,
                    substrRegex;

                // an array that will be populated with substring matches
                matches = [];

                // regex used to determine if a string contains the substring `q`
                substrRegex = new RegExp(q, 'i');

                // iterate through the pool of strings and for any string that
                // contains the substring `q`, add it to the `matches` array
                $.each(tags, function(index, value) {

                    if (substrRegex.test(index)) {
                        $(value).each(function(index2, hash) {
                            matches.push(hash);
                        });
                    }
                });

                cb(matches);
            };
        };

        /**
         * Return hash part of the URL
         */
        var getURI = function() {
            return location.hash.split('#')[1];
        };

		/**
		 * Activate module - highlights associated anchor, scrolls to anchor
		 * in navigation pane and plays the video.
         * the vidObj argumend could be module, subModule, or subSection
		 */

        var activateModule = function(vidObj, timeOffset) {
            var $anchor = $('nav a[data-media-path="' + vidObj.path + '"]');
			$anchor.highlightAndGoTo(options.nav);
            var video = options.video[0]; // un-jQuery DOMElement
            video.src = vidObj.path; // this should be parsed URI

            var track = document.getElementById("captions");
            var host = location.hostname;
            if(vidObj.caption.length > 0 && host != '' ) {
                track.src = vidObj.caption;
            } else {
                $('#captions').remove();
            }

            $(video).on('loadedmetadata', function() {
                video.currentTime = (timeOffset >= REVISIT_TIME_OFFSET ? (timeOffset - REVISIT_TIME_OFFSET) : timeOffset);
                this.play();
            });
		};

        //
        // "public"
        //

        /**
         * Examines URI after hash and attempts to load a video associated
         * with the supplied module, sub-module and video time-offset.
         */
        this.loadFromURI = function() {
            if (location.hash.length > 0 && location.hash.match(/[<>]+/)) { // basic reflected XSS prevention.
                location.href = 'index.html';
            }
            var uri = decodeURIComponent(getURI());

            if (uri) {
                var videoPath = /video-path=(.*?)\&/.exec(uri)[1],
                    timeOffset = /.*time-offset=([0-9]+)$/i.exec(uri)[1]

                $(options.modules).each(function(index, module) {
                    if (module.path === videoPath) {
                        activateModule(module, timeOffset);
                    } else {
                        $(module.subModules).each(function(index, subModule) {
                            if (subModule.path === videoPath) {
                                activateModule(subModule, timeOffset);
                            } else {
                                $(subModule.subSections).each(function(index, subSection) {
                                    if (subSection.path === videoPath) {
                                        activateModule(subSection, timeOffset);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        };

        /**
         * Find out if a video for with a particular module, subModule, and subSection exists.
         * If it does, then return it.
         */
        var possibleNextVideo = function(moduleIndex, subModuleIndex = null, subSectionIndex = null) {
            var candidate;

            var moduleMissing = typeof (options.modules[moduleIndex]) === 'undefined';
            if (moduleIndex && moduleMissing) {
                return;
            }

            var subModulesMissing = typeof (options.modules[moduleIndex].subModules[subModuleIndex]) === 'undefined';
            if ((subModuleIndex !== null) && subModulesMissing) {
                return;
            }

            var subSectionsMissing;
            if (subModuleIndex !== null) {
                subSectionsMissing = typeof (options.modules[moduleIndex].subModules[subModuleIndex].subSections) === 'undefined';
                if ((subSectionIndex  !== null) && subSectionsMissing) {
                    return;
                }
            }

            if (subSectionIndex !== null) {
                // grab a subSection, i.e. _01_01.mp4
                candidate = options.modules[moduleIndex].subModules[subModuleIndex].subSections[subSectionIndex];
            } else if (subModuleIndex !== null) {
                // grab a subModule, i.e. _02_00.mp4
                candidate = options.modules[moduleIndex].subModules[subModuleIndex];
            } else {
                // grab a module, i.e. _00_00.mp4
                candidate = options.modules[moduleIndex];
            }
            return candidate;
        }


        /**
         * Find the next video object, based on the current URL.
         * The term 'vidObj' is a big vague, but it the goal to describe a JSON object that may ba a module, subModule, or subSection
         */

       var findNextVidObj = function() {
           var src = document.getElementById('video');
           var vidUrl = src.currentSrc;
           var currentVidFilename = vidUrl.split('/').reverse()[0].replace('.mp4', '');
           var currentVidFilenameParts = currentVidFilename.split('_');


           var vidPath = $(src).attr("src").split('/').reverse()[0].replace('.mp4', '');;
           var currentVidFilenameParts = vidPath.split('_');

           var currentModulePrefix = currentVidFilenameParts[0];
           var currentModuleIndex;

           $(options.modules).each((modIndex, mod) => {
               var prefix = /media\/video\/(.*?)\_/.exec(mod.path)[1];
               if (prefix === currentModulePrefix) {
                   currentModuleIndex = modIndex;
               }
           })

           var currentSubmoduleNum = currentVidFilenameParts[1];
           var currentSubmoduleIndex = parseInt(currentSubmoduleNum) - 1;
           var nextSubmoduleIndex = parseInt(currentSubmoduleNum);

           var currentSubSection = currentVidFilenameParts[2];
           var nextSubSectionIndex = parseInt(currentSubSection);

           if (currentSubmoduleIndex === -1) {
               // we know we're on the top-level module, video #1, _00_00
               nextVidCandidate = possibleNextVideo(currentModuleIndex, nextSubmoduleIndex);
           } else {
                nextVidCandidate = possibleNextVideo(currentModuleIndex, currentSubmoduleIndex, nextSubSectionIndex);
           }

           if (!nextVidCandidate) {
                // Try the next submodule
               nextVidCandidate = possibleNextVideo(currentModuleIndex, nextSubmoduleIndex)
           }
           if (!nextVidCandidate) {
               // try the next module
               nextVidCandidate = possibleNextVideo(currentModuleIndex + 1);
           }

           return nextVidCandidate;
       }


        /**
         * Initializer - Populates Navigation pane as well and
         *               updates search tags.
         * @param opts - Hash (see below function signature)
         * @see js/course.json.js
         */
        this.init = function(opts) {
            var _this = this;
            options = {
                'modules': null, // array object
                'video': null, // jQuery object
                'nav': null, // jQuery object
            };
            $.extend(options, opts);

            // Clear navigation pane
            $('*', options.nav).remove();

            /*
             * We will cycle through the coureJSON variable and append links to the
             * navigation pane as we do so. We will also be appending data to the
             * tags object which is populated and used as an index for tag/keyword searching.
             * Yes - we have some duplicate data between the tags index
             * and the courseJSON. This is by design as the course JSON is intended to be
             * easily managed by a human while the tag index is intended to be managed by this code
             * for faster keyword searching.
             */
            $(options.modules).each(function(moduleIndex, module) { // Iterate through modules

                // Update tags structure
                $(module.tags).each(function(moduleIndex, tag) {
                    tags[tag] = tags[tag] || [];
                    tags[tag].push({module: module.title, 'sub-module': 'Main', path: module.path});
                });
                if($(module.subModules).length) {
                var $listItem = $('<li class="module-title" />');
                } else {
                    var $listItem = $('<li class="module-title single" />');
                }
                $listItem.append(
                    $('<a />', {
                        'class': 'module active',
                        'href': 'index.html#video-path=' + module.path  + '&time-offset=0',
                        'html': module.title,
                        'data-media-path': module.path,
                        'data-caption-path': module.caption
                    }).on('click', function() { // Anchor click handler
                        $('.module-title').removeClass('open');
                        $(this).addClass('open');
                        location.href = '#video-path=' + module.path  + '&time-offset=0';
                        _this.loadFromURI();
                    })
                );


                
                if ($(module.subModules).length) {
                var $subList  = $('<ul class="submenu" />');
                $(module.subModules).each(function(index, subModule) { // Iterate through sub-modules

                    // Update tags structure
                    $(subModule.tags).each(function(subModuleIndex, tag) {
                        tags[tag] = tags[tag] || [];
                        tags[tag].push({module: module.title, 'sub-module': subModule.title, path: subModule.path});
                    });

                    var $subListItem = $('<li />');

                    // Append subModule anchor data to navigation panel
                    $subListItem.append(
                        $('<a />', {
                            'class': 'sub-module active',
                            'href': 'index.html#video-path=' + subModule.path  + '&time-offset=0',
                            'html': subModule.title,
                            'data-media-path': subModule.path,
                            'data-caption-path': subModule.caption
                        }).on('click', function() { // Anchor click handler
                            location.href = '#video-path=' + subModule.path  + '&time-offset=0';
                            _this.loadFromURI();
                        })
                    );
                    $subList.append($subListItem);


                    

                    // Do the same as above for each subModule's subSections
                    if ($(subModule.subSections).length) {
                        var $subSection = $('<ul class="subSection-menu" />');
                        $(subModule.subSections).each(function(index, subSection) {
                            // FIXME: dupe'd code with a li'l variable renaming  BND
                            $(subSection.tags).each(function(subSectionIndex, tag) {
                                tags[tag] = tags[tag] || [];
                                tags[tag].push({module: module.title, 'sub-module': subSection.title, path: subSection.path});
                            });
                            var $subSectionItem = $('<li />');

                            // Append sub-section anchor data to navigation panel
                            $subSectionItem.append(
                                $('<a />', {
                                    'class': 'sub-module active',
                                    'href': 'index.html#video-path=' + subSection.path  + '&time-offset=0',
                                    'html': '&ndash;&nbsp;' + subSection.title,
                                    'data-media-path': subSection.path,
                                    'data-caption-path': subSection.caption
                                }).on('click', function() { // Anchor click handler
                                    location.href = '#video-path=' + subSection.path  + '&time-offset=0';
                                    _this.loadFromURI();
                                })
                            );

                            $subSection.append($subSectionItem);

                        });
                    }

                    $subList.append($subSection);
                });
            }

                $listItem.append($subList);
                options.nav.append($listItem);
            });

			// Update location hash time-offset as the video progresses.
            options.video.on('timeupdate', function() {
                location.href = location.href.replace(/time-offset=(\d)+/i, 'time-offset=' + Math.floor(this.currentTime).toString());
            });

			// When the video ends, go to the next video.
			// If on the last video, go to the first video.
			options.video.on('ended', function() {
				// Advance to next video
				function advance() {
                    var vidObj = findNextVidObj();
                    if (vidObj) {
                        var vidPath = vidObj.path
                        var $anchor = $('nav a[data-media-path="' + vidPath + '"]'),
                        module = $anchor.data('module'),
                        subModule = $anchor.data('sub-module');

                        location.href = '#video-path=' + vidPath  + '&time-offset=0';
                        _this.loadFromURI();
                    } else {
                        // there are no more videos to play
                        return false
                    }

				}

				if (false === $('#loop')[0].checked) {
					return false;
				} else {
					advance();
				}
            });

            $('#search-bar .typeahead').typeahead(
                {
                    hint: true,
                    highlight: false,
                    minLength: 2
                },
                {
                    name: 'tags',
                    limit: 10,
                    source: substringMatcher(tags),
                    display: 'garbage_that_wont_be_displayed',
                    templates:{
                        empty: '<div class="empty-message">No matches</div>',
                        suggestion: Handlebars.compile(
                            ['<div onclick="location.href=\'#video-path={{path}}&time-offset=0\';PWK.loadFromURI();" data-path="{{path}}">',
                                '{{module}} - {{sub-module}}',
                            '</div>'].join("\r\n")
                        )
                    }
                }
            );

            // If a bookmark has been passed into the URI, go to that bookmark.
            // Note if the bookmark is invalid, the page will reload and the first
            // video will be played.
            if (location.href.match(/#video-path=/)) {
                this.loadFromURI();
            } else {
                // If no bookmark is passed, play the first video:
                $('a', options.nav).first().click();
            }

            //PLYR Custom Buttons and controls
            const controls = `
            <div class="plyr__controls">
                <button type="button" id="restart" class="plyr__control" data-plyr="restart">
                    <!--<svg role="presentation"><use xlink:href="#plyr-restart"></use></svg>-->
                    <img src="media/img/restart.svg" />
                    <span class="plyr__tooltip" role="tooltip">Restart</span>
                </button>
                <button type="button" id="rewind" class="plyr__control" data-plyr="rewind">
                    <!-- <svg role="presentation"><use xlink:href="#plyr-rewind"></use></svg> -->
                    <img src="media/img/rewind.svg" />
                    <span class="plyr__tooltip" role="tooltip">Rewind {seektime} secs</span>
                </button>
                <button type="button" class="plyr__control" aria-label="Play, {title}" data-plyr="play">
                    <svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-pause"></use></svg>
                    <svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-play"></use></svg>
                    <span class="label--pressed plyr__tooltip" role="tooltip">Pause</span>
                    <span class="label--not-pressed plyr__tooltip" role="tooltip">Play</span>
                </button>
                <button type="button" id="forward" class="plyr__control" data-plyr="fast-forward">
                    <!--<svg role="presentation"><use xlink:href="#plyr-fast-forward"></use></svg>-->
                    <img src="media/img/forward.svg" />
                    <span class="plyr__tooltip" role="tooltip">Forward {seektime} secs</span>
                </button>
                <button type="button" id="nextVideo" class="plyr__control">
                    <img src="media/img/step-forward.svg" />
                    <span class="plyr__tooltip" role="tooltip">Next Video</span>
                </button>
                <div class="plyr__controls__item plyr__progress__container">
                    <div class="plyr__progress">
                        <input data-plyr="seek" type="range" min="0" max="100" step="0.01" value="0" aria-label="Seek">
                        <progress class="plyr__progress__buffer" min="0" max="100" value="0">% buffered</progress>
                        <span role="tooltip" class="plyr__tooltip">00:00</span>
                    </div>
                </div>
                <div class="plyr__time plyr__time--current" aria-label="Current time">00:00</div>
                <div class="plyr__time plyr__time--duration" aria-label="Duration">00:00</div>
                <button type="button" class="plyr__control" aria-label="Mute" data-plyr="mute">
                    <svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-muted"></use></svg>
                    <svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-volume"></use></svg>
                    <span class="label--pressed plyr__tooltip" role="tooltip">Unmute</span>
                    <span class="label--not-pressed plyr__tooltip" role="tooltip">Mute</span>
                </button>
                <div class="plyr__volume">
                    <input data-plyr="volume" type="range" min="0" max="1" step="0.05" value="1" autocomplete="off" aria-label="Volume">
                </div>
                <button type="button" class="plyr__control" data-plyr="captions">
                    <svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-captions-on"></use></svg>
                    <svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-captions-off"></use></svg>
                    <span class="label--pressed plyr__tooltip" role="tooltip">Disable captions</span>
                    <span class="label--not-pressed plyr__tooltip" role="tooltip">Enable captions</span>
                </button>
                <button type="button" class="plyr__control" data-plyr="fullscreen">
                    <svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-exit-fullscreen"></use></svg>
                    <svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-enter-fullscreen"></use></svg>
                    <span class="label--pressed plyr__tooltip" role="tooltip">Exit fullscreen</span>
                    <span class="label--not-pressed plyr__tooltip" role="tooltip">Enter fullscreen</span>
                </button>
            </div>
            `;
            const player = new Plyr('#video', {
                captions: {update: true},
                controls
            });
            // Next Video Button
            $('#nextVideo').on('click', function() {

                function next(vidPath) {
                    var $anchor = $('nav a[data-media-path="' + vidPath + '"]'),
                        module = $anchor.data('module'),
                        subModule = $anchor.data('sub-module');

                    location.href = '#video-path=' + vidPath  + '&time-offset=0';
                    _this.loadFromURI();
                }

                var vidObj = findNextVidObj();
                if (vidObj) {
                    next(vidObj.path);
                }
            });
        };
    } // PWK

	//
	// Expose our PWK object to the main window object for use.
	//
    window.PWK = new PWK();

})(jQuery);
