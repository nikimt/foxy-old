// Controller for idea bubbles
// Contributer: Jessica, Niki

angular.module('ideaBubbleCtrl', ['ideaService'])

.controller('ideaBubbleController', function($scope,idea, $routeParams) {

	/**
	* Reload the route
	*/
	$scope.reloadRoute = function() {
  		location.reload();
	}

	var vm = this;

	// INITIALIZE VARIABLES

	// set a processing variable to show loading things
	vm.processing = true;
	// current board
	vm.boardId = $routeParams.board_id
	// set a playing variable for stopping/playing the animation of moving bubbles
	vm.playing = true;
	// idea to show the additional options
    vm.ideaToShow;
    vm.hideExplanation = true;
    vm.hideNotes = true;
    vm.hideOptions = true;
    vm.showPanel = (!vm.hideExplanation || !vm.hideNotes || !vm.hideOptions);

    vm.saveBoardError = false;
    vm.boardSaved = false;
    vm.hasExplanation = false;
    
    vm.isModerator = false;
    vm.isOwner = false;
    vm.canDelete = (vm.isModerator || vm.isOwner);
    vm.showFlag = true;

    vm.flagState = "Flag";

	// variables for moving bubble animation
	var paper, circs, flags, flagTexts, deleteTexts, texts, deletes, i, nowX, nowY, timer, props = {}, toggler = 0, elie, dx, dy, rad, cur, opacity; 
	var ideaTimer = 2000;
	var ideasToCircs = {}

    /**
    * Get all the ideas at page load
    */
    idea.all($routeParams.board_id)
        .then(function(data) {

            // when all the ideas come back, remove the processing variable
            vm.processing = false;

            // bind the ideas that come back to vm.ideas
            vm.ideas = data.data.data.ideas;
            initCanvas();
            getBubbles();
            moveIt();
            grabIdeas();
            checkBubbles();
        });

	/**
	* Update the flag text
	*/	
    var updateFlagText = function() {
        if (vm.ideas[vm.ideaToShowIndex].meta.flag == true) {
            vm.flagState = "Unflag";
        } else {
            vm.flagState = "Flag";
        }
    }

	/**
	* Update whether an idea has an explanation
	*/	
    var updateHasExplanation = function() {
        if (vm.ideas[vm.ideaToShowIndex].explanation) {
            vm.hasExplanation = true;
        } else {
            vm.hasExplanation = false;
        }
    }

	/**
	* Update whether an idea can be flagged or not
	*/	
    var updateShowFlag = function() {
        if (vm.ideas[vm.ideaToShowIndex].meta.flag == true) {
            if (vm.isModerator) {
                vm.showFlag = true;
            } else {
                vm.showFlag = false;
            }
        } else {
            vm.showFlag = true;
        }
    }

	/**
	* Toggle function for playing and stopping the animation of the moving bubbles
	*/
    vm.toggleAnimation = function() {
    	if(vm.playing){
    		vm.playing = false;
    		clearTimeout(timer);
    	} else {
    		vm.playing = true;
    		moveIt();
    	}
    }

	/**
	* Upvote an idea
	*/
	vm.upvote = function(){
		var ideaId = vm.ideaToShow
		if(!vm.upvoted){
			idea.upvote($routeParams.board_id,ideaId).then(function(data){
					vm.upvoted = true;
					grabIdeas;
			})
		}
		if(vm.upvoted){
			idea.unupvote($routeParams.board_id,ideaId).then(function(data){
					vm.upvoted = false;
					grabIdeas();
			});
		}
        updateFlagText();
	}

	/**
	* Delete an idea
	*/
	vm.delete = function() {
		var ideaId = vm.ideaToShow
		idea.delete($routeParams.board_id,ideaId).then(function(data){
				idea.all($routeParams.board_id)
					.then(function(data) {
						vm.processing = false;
						vm.ideas = data.data.data.ideas;
				});
				if(data.data.success){
					var bubble = ideasToCircs[ideaId].bubble
					bubble.remove()
					var text = ideasToCircs[ideaId].text
					text.remove()
					var flagText = ideasToCircs[ideaId].flagText
					flagText.remove()
					var flag = ideasToCircs[ideaId].flag
					flag.remove()
					vm.showPanel = false;
				} else {
					vm.deleteError = data.data.err.msgToUser
				}
		})
        updateFlagText();     
	}

	/**
	* Flag an idea
	*/
	vm.flag = function(){
		var index = getIdeas(vm.ideaToShow)
		if (vm.ideas[index].meta.flag == false) {
			var ideaId = vm.ideaToShow
			idea.flag($routeParams.board_id,ideaId).then(function(data){
					idea.all($routeParams.board_id)
						.then(function(data) {
							vm.processing = false;
							vm.ideas = data.data.data.ideas;
							// update flag icon
							var flagText = '\u2691';
							var flagTextBubble = ideasToCircs[ideaId].flagText
							flagTextBubble.attr("text",flagText)
                            updateFlagText();
						});
			});
			} else {
				var ideaId = vm.ideaToShow
				idea.unflag($routeParams.board_id,ideaId).then(function(data){
					if(!data.data.success){
						vm.flagError = data.data.err.msgToUser
					} else {
						// update flag icon
						var flagText = '';
						var flagTextBubble = ideasToCircs[ideaId].flagText
						flagTextBubble.attr("text",flagText)
                        updateFlagText();						
					}
					grabIdeas();
				})
			}
            updateFlagText();
		}

	/**
	* Get an idea from its id
	* @param id of the idea
	*/
	var getIdeas = function(id){
		for(var i = 0; i < vm.ideas.length; i ++){
			if(vm.ideas[i]._id == id){
				return i
			}
		}
	}

    /**
    * Show the options for an idea
    * @param obj, the event obj that was clicked
    */
    vm.showOptions = function(obj){
    	vm.hideOptions = true;
    	var clickedCircleId = obj.target.id
    	vm.ideaToShow = clickedCircleId
        if (vm.ideaToShow) {
        	vm.hideOptions = false;
            vm.showPanel = (!vm.hideExplanation || !vm.hideNotes || !vm.hideOptions);

    		var ideaId = vm.ideaToShow
    		vm.ideaToShowIndex = getIdeas(ideaId)
			vm.ideaTitle = ideasToCircs[ideaId].content

            idea.isOwner(vm.boardId, vm.ideas[vm.ideaToShowIndex]._id).then(function(data) {
                vm.isOwner = data.data.is_user_owner;
                vm.canDelete = (vm.isModerator || vm.isOwner);
            });

    		updateFlagText();
            updateShowFlag();
            updateHasExplanation();

    		idea.getNotes($routeParams.board_id,ideaId).then(function(data){
    			vm.noteToShow = data.data.notes
    			grabIdeas();
    		});
        } else {
            vm.hideOptions = true;
            vm.showPanel = (!vm.hideExplanation || !vm.hideNotes || !vm.hideOptions);
        }
    }

    /**
    * Hide an explanation for an idea when it is clicked
    */
    vm.hideExplanationClick = function(){
    	vm.hideExplanation = true;
        vm.showPanel = (!vm.hideExplanation || !vm.hideNotes || !vm.hideOptions);
    }

    /**
    * Show an explanation for an idea when it is clicked
    */
    vm.showExplanationClick = function(){
    	if (vm.hideExplanation == true) {
    		vm.hideExplanation = false;
            vm.showPanel = (!vm.hideExplanation || !vm.hideNotes || !vm.hideOptions);
    	} else {
    		vm.hideExplanation = true;
            vm.showPanel = (!vm.hideExplanation || !vm.hideNotes || !vm.hideOptions);
    	}
    }

    /**
    * Show notes for an idea when it is clicked
    */
    vm.showNotesClick = function(){
    	if (vm.hideNotes == true) {
    		vm.hideNotes = false;
            vm.showPanel = (!vm.hideExplanation || !vm.hideNotes || !vm.hideOptions);
    	} else {
    		vm.hideNotes = true;
            vm.showPanel = (!vm.hideExplanation || !vm.hideNotes || !vm.hideOptions);
    	}
    }

    /**
    * Hide notes for an idea when it is clicked
	*/
    vm.hideNotesClick = function(){
    	vm.hideNotes = true;
        vm.showPanel = (!vm.hideExplanation || !vm.hideNotes || !vm.hideOptions);
    }

    /**
    * Hide options for an idea when it is clicked
	*/
    vm.hideOptionsClick = function(){
    	vm.hideOptions = true;
        vm.showPanel = (!vm.hideExplanation || !vm.hideNotes || !vm.hideOptions);
    }

    vm.hideSaveErrorClick = function(){
        vm.saveBoardError = false;
    }

	/**
	* Get the ideas
	*/
	var grabIdeas = function(){	
		idea.all($routeParams.board_id)
		.then(function(data) {

			// when all the ideas come back, remove the processing variable
			vm.processing = false;

			// bind the ideas that come back to vm.ideas
			vm.ideas = data.data.data.ideas;
		});
		setTimeout(grabIdeas,ideaTimer);
	}

	/**
	* Save an idea
	*/
	vm.saveIdea = function() {
		vm.processing = true;
		vm.message = '';

		// use the create function in the ideaservice
		idea.create($routeParams.board_id, vm.ideaData)
			.then(function(data) {
				vm.processing = false;
				vm.ideaData = {};
				vm.message = 'Successfully created an idea'
				grabIdeas();
			});
			
	}

	/**
	* Save a note
	*/
	vm.saveNote= function(){
		vm.processing = true

		var ideaId = vm.ideaToShow
		vm.getNote(ideaId)

		idea.createNote($routeParams.board_id,ideaId,vm.noteData).then(function(data){
			vm.noteData = {}
			vm.getNote(ideaId)
		})
	}

	/**
	* Retrieve the notes for a specific idea
	* @param ideaId, id of the idea to get the notes of
	*/
	vm.getNote = function(ideaId){
		idea.getNotes($routeParams.board_id,ideaId).then(function(data){
			vm.noteToShow = data.data.notes
			grabIdeas();
		})
	}

	/**
	* Check if board has already been saved by the user at page load
	*/
	idea.isLoggedIn()
		.then(function(data){
			vm.loggedIn = data.data.loggedIn
			if(vm.loggedIn){
				idea.getBoards().then(function(data){
					var allBoards = data.data.boards
					for(var i = 0; i < allBoards.length; i ++){
						if(allBoards[i] === vm.boardId){
							vm.boardSaved = true;
						}
					}

				})
			}
		})

	vm.saveBoard = function(){
		idea.saveUserBoard($routeParams.board_id).then(function(data){
			if(data.data.success){
				vm.boardSaved = true;
			} else {
				vm.saveBoardError = data.data.errMsg;
			}
		})
	}

    idea.isModerator($routeParams.board_id).then(function(data) {
        vm.isModerator = data.data.is_user_moderator;
    });

	// ANIMATION FOR MOVING BUBBLES

    /**
    * Initialize the properties of a bubble
    * @param circle, the bubble to initialize
    */
	var initCircle = function(circle) {    
	        // Reset when time is at zero
	        if (! circle.time) 
	        {
	            circle.time  = 0
	            circle.deg   = 160;
	            circle.vel   = 1;  
	            circle.curve = 0.5;
	        }       
	    } 

	/**
	* Create a bubble from an idea
	*/ 
	var createBubble = function(idea){
		var clientHeight = document.getElementById('canvas').clientHeight;
        var clientWidth = document.getElementById('canvas').clientWidth;

        var opacity = 0.6;
        var posXMin = clientWidth / 3;
        var posXMax = clientWidth / 1.5;
        var posYMin = clientHeight / 3;
        var posYMax = clientHeight / 1.5;
        var posX = ran(posXMin,posXMax);
        var posY = ran(posYMin,posYMax);
        var color = randomColor({luminosity: 'dark'});
        var heightScale = 8;
        var radiusOfCircle = clientHeight/heightScale
        var ideaCircle = paper.circle(posX, posY, radiusOfCircle).attr({"fill-opacity": opacity, "stroke-opacity": opacity, fill: color, stroke: color})
        ideaCircle.node.id = idea._id
        var text = idea.content
        var ideaText = paper.text(posX, posY, text).attr({"fill": "white"})
        return {
        	"ideaCircle": ideaCircle,
        	"ideaText": ideaText,
        	"color": color,
        	"posX": posX,
        	"posY": posY
        }		
	}


	/**
	* Create a flag bubble
	* @param idea
	* @param color of the bubble
	* @param posX
	* @param posY
	* @param circBubble
	*/
	var createFlagBubble = function(idea,color,posX,posY,circBubble){
		var opacity = 0.5;
		var textFontSize = 18;
		var radiusOfFlagCircle = 15;
        var flagMark = (idea.meta.flag == true ? '\u2691' : '');
        var flagTextsCircle = paper.text(posX + circBubble.attr("r"), posY + circBubble.attr("r"), flagMark).attr({"fill": "white","font-size": textFontSize})
        var flagCircle = paper.circle(posX + circBubble.attr("r"), posY + circBubble.attr("r"),radiusOfFlagCircle).attr({"fill-opacity": opacity, "stroke-opacity": opacity, fill: color, stroke: color})
        return {
        	"flagTextsCircle": flagTextsCircle,
        	"flagCircle": flagCircle
        }
	}

	/**
	* Checks whether the ideas and bubbles are consistent
	*/
	var checkBubbles = function(){
		var deleteIds = []
		for(ideaBubble in ideasToCircs){
			var ideaIds = [];
			for(var j = 0; j < vm.ideas.length; j++){
				ideaIds.push(vm.ideas[j]._id)
			}
			if(ideaIds.indexOf(ideaBubble) == -1){
				deleteIds.push(ideaBubble)
				var bubble = ideasToCircs[ideaBubble].bubble
				bubble.remove()
				var text = ideasToCircs[ideaBubble].text
				text.remove()
				var flagText = ideasToCircs[ideaBubble].flagText
				flagText.remove()
				var flag = ideasToCircs[ideaBubble].flag
				flag.remove()
			}
		}

		for(var i = 0; i < deleteIds.length; i ++){
			delete ideasToCircs[deleteIds[i]]
		}

		setTimeout(checkBubbles,ideaTimer)
	}
	    
	/**
	* Move the bubbles
	*/	
	var moveIt = function()
	    {
	    	var clientHeight = document.getElementById('canvas').clientHeight;
            var clientWidth = document.getElementById('canvas').clientWidth;

	    	var moveTimer = 60;

	        for(var i = 0; i < vm.ideas.length; i ++)
	        {  	
	        	var idea = vm.ideas[i]
	        	var ideaBubbleId = vm.ideas[i]._id
	        	// add new bubbles
	        	if(!(ideaBubbleId in ideasToCircs)){
		        	var bubble = createBubble(idea)
		        	circs.push(bubble.ideaCircle);
			        texts.push(bubble.ideaText)
			        var flagBubble = createFlagBubble(idea,bubble.color,bubble.posX,bubble.posY,bubble.ideaCircle)
			        flagTexts.push(flagBubble.flagTextsCircle)		       
			        flags.push(flagBubble.flagCircle)
			        ideasToCircs[idea._id] = {"bubble": bubble.ideaCircle, "text": bubble.ideaText, "flagText": flagBubble.flagTextsCircle, "flag": flagBubble.flagCircle,"content": idea.content}
			        initCircle(ideasToCircs[idea._id].bubble);
	        	}

	        	var ideaBubble = ideasToCircs[ideaBubbleId]

	        	var circBubble = ideaBubble.bubble
	        	var textBubble = ideaBubble.text
	        	var flagBubble = ideaBubble.flag
	        	var flagTextBubble = ideaBubble.flagText

	            var degXMin = 175;
	            var degXMax = 180; 
	            var degYMin = 175;
	            var degYMax = 180;
	            var upvoteIncreaseScale = 50;
	            var flagIncreaseScale = 15;
	            var semiCircDeg = 180;
	            var paddingMin = 20;
	            var paddingMax = - 20;
	            var maxRadius = 500;

	            var radius = (vm.ideas[i].meta.upvotes.upvote_count + 1) * upvoteIncreaseScale;
	            if(radius > maxRadius){
	            	radius = maxRadius
	            }
	            circBubble.attr("r",radius);
	            circBubble.curve = ran(0,1);  

	            // Get position
	            nowX = circBubble.attr("cx");
	            nowY = circBubble.attr("cy");

	            // Calc movement
	            dx = circBubble.vel * Math.cos(circBubble.deg * Math.PI/semiCircDeg);
	            dy = circBubble.vel * Math.sin(circBubble.deg * Math.PI/semiCircDeg);

	            // Calc new position
	            nowX += dx;
	            nowY += dy;

	            // Bounce off walls
	            if (nowX < (paddingMin + circBubble.attr("r")))
	            {
	                circBubble.vel = circBubble.vel * -1
	                circBubble.deg   = ran(degXMin,degXMax);
	            }

	            else if(nowX > (clientWidth - (paddingMax + circBubble.attr("r"))))
	            {
	                circBubble.vel = circBubble.vel * -1
	                circBubble.deg   = ran(degXMin,degXMax);
	            }

	            if (nowY < (paddingMin + circBubble.attr("r")))
	            {
	                circBubble.vel = circBubble.vel * -1
	                circBubble.deg   = ran(degYMin,degYMax);
	            }

	            else if(nowY > (clientHeight - (paddingMax + circBubble.attr("r"))))
	            {
	                circBubble.vel = circBubble.vel * -1 
	                circBubble.deg   = ran(degYMin,degYMax);
	            }         
	            
	            // Render moved particle
	            circBubble.attr({cx: nowX, cy: nowY});
	            textBubble.attr({x: nowX, y: nowY})
	            flagBubble.attr({cx: nowX + circBubble.attr("r"), cy: nowY - circBubble.attr("r"), r: (vm.ideas[i].meta.upvotes.upvote_count + 1)*flagIncreaseScale})
	            flagTextBubble.attr({x: nowX + circBubble.attr("r"), y: nowY - circBubble.attr("r")})
	            
	            // Calc curve so that bubble curves slightly when moving
	            if (circBubble.curve > 0){
	            	circBubble.deg = circBubble.deg + 1;
	            }
	            else {
	            	circBubble.deg = circBubble.deg - 1;
	            }

	            // Update whether idea is flagged
	            var flagMark = (vm.ideas[i].meta.flag == true ? '\u2691' : '');
	            flagTexts[i].attr({"text": flagMark})

	            // Progress timer for particle
	            circBubble.time = circBubble.time - 1;            	       
	        }

	        timer = setTimeout(moveIt, moveTimer);
	    }

	/**
	* Random number generator
	*/
    var ran = function(min, max)  
    {  
        return Math.floor(Math.random() * (max - min + 1)) + min;  
    }

    /**
    * Initialize the canvas for the moving bubbles
    *
    */
    var initCanvas = function(){
        var clientHeight = document.getElementById('canvas').clientHeight;
        var clientWidth = document.getElementById('canvas').clientWidth;

        paper = Raphael("canvas", clientWidth, clientHeight);
        circs = paper.set();
        texts = paper.set(); 
        flags = paper.set();
        flagTexts = paper.set();
        deletes = paper.set();
        deleteTexts = paper.set();   	
    }

    /**
    * Get the bubbles from the ideas
    */
    var getBubbles = function(){

	        for (i = 0; i < vm.ideas.length; ++i)
	        {
	        	// create the bubbles
	        	var idea = vm.ideas[i]
	        	var bubble = createBubble(idea)
	        	circs.push(bubble.ideaCircle);
		        texts.push(bubble.ideaText)
		        var flagBubble = createFlagBubble(idea,bubble.color,bubble.posX,bubble.posY,bubble.ideaCircle)
		        flagTexts.push(flagBubble.flagTextsCircle)		       
		        flags.push(flagBubble.flagCircle)
		        ideasToCircs[idea._id] = {"bubble": bubble.ideaCircle, "text": bubble.ideaText, "flagText": flagBubble.flagTextsCircle, "flag": flagBubble.flagCircle,"content": idea.content}
	        }
	        for(ideaBubble in ideasToCircs){
	        	var ideaBubbleContent = ideasToCircs[ideaBubble]
	            initCircle(ideaBubbleContent.bubble);
	        }      
	}

});
