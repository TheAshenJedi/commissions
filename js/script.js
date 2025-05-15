// Keeps track if a series link was clicked - used in enableImageSeriesLinks()
var series_link_clicked = false;
var series_link_clicked_index = null;
// Keeps track of tags and which images to show - used in ready()'s shuffle function and createTagsDropdown()
var tags_to_show = {};

// When the document finished loading and is ready...
$(document).ready(function() {
	// The gallery images from data.js
	var images = data.images;
	// Set of tags collected from the images
	const tags = new Set();
	setUpGallery(images, tags, false);
	createTagsDropdown(tags);
	updateImageCountLabel();

	// Shuffle the image order when the shuffle button is clicked
	$("#shuffle").click(function() {
		setUpGallery(images, tags, true);

		// Show only the images that need to be shown (filtering by tags)
		showImagesThatMatch();
	});

	// Handle closing the modal when the back button is clicked
	backButtonHideModal();

	// If the URL has a hash, then open that image based on the hash index
	if (window.location.hash) {
		var hash_index = window.location.hash.substring(1);
		$("#img"+hash_index).click();
	}
});

// Create the gallery image modal description section
function getModalDescText(image) {
	text = "";
	if (image.src.length == 1) {
		text += "1 image<br/><br/>";
	}
	else {
		text += ""+image.src.length+" images<br/><br/>";
	}
	text += "<strong>Artist:</strong> "+image.artist+"<br/>";

	if (image.artist_url == null) {
		text += "";
	}
	else {
		text += "<strong><a href='"+image.artist_url+"' data-bs-toggle='tooltip' data-bs-placement='right' title='"+image.artist_url+"' target='_blank'>Artist's Page</a></strong><br/>";
	}

	if (image.art_url == null) {
		text += "Artwork was not posted publicly.<br/>";
	}
	else {
		text += "<strong><a href='"+image.art_url+"' data-bs-toggle='tooltip' data-bs-placement='right' title='"+image.art_url+"' target='_blank'>Art Source</a></strong><br/>";
	}

	text += "<br/><strong>Description:</strong><br/>" + image.desc + "<br/>";

	text += "<br/>[" + image.date_str + "]<br/>";

	if (image.tags.length == 0) {
		text += "<br/><strong>No tags</strong><br/>";
	}
	else if (image.tags.length == 1 && image.tags[0] == "") {
		text += "<br/><strong>No tags</strong><br/>";
	}
	else {
		text += "<br/><strong>Tags:</strong> "
		for (var i = 0; i < image.tags.length; i += 1) {
			text += translateWord(image.tags[i])
			if (i < image.tags.length - 1) {
				text += " + "
			}
		}
	}

	return text;
}

// Enable tooltips
function enableTooltips() {
	var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
	var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
		return new bootstrap.Tooltip(tooltipTriggerEl)
	})
}

// Shuffle an array (Fisher-Yates [aka Knuth] Shuffle)
function shuffle(array) {
	var currentIndex = array.length,  randomIndex;
	// While there remain elements to shuffle...
	while (currentIndex != 0) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}

	return array;
}

function setUpGallery(images, tags, shuffleOrder) {
	// The indexes of the images array which will determine in which order the images will be displayed in the gallery
	var images_indexes = [...Array(images.length).keys()];
	
	// Shuffle the images indexes for a random order every time the page is loaded
	if (shuffleOrder) {
		shuffle(images_indexes);
	}

	var gallery_html = "";
	// For every image, display it in the gallery
	for (var i = 0; i < images_indexes.length; i += 1) {
		var index = images_indexes[i];
		var image = images[index];
		var tags_class = image.tags.join(" ");	// CSS classes for tags
		// Add tag to the tags set
		for (var t = 0; t < image.tags.length; t += 1) {
			tags.add(image.tags[t]);
		}
		// If image is hidden, then don't show it
		gallery_html += "<a data-bs-toggle='modal' data-bs-target='#imageModal' class='gallery-img"+((image.hidden) ? " hidden-image" : "") +"' index='"+index+"' id='img"+index+"'><img src='"+image.thumbnail+"' alt='"+image.alt+"' index='"+index+"' class='"+tags_class+"'></a>";
	}
	$("#gallery").html(gallery_html);

	// Add a click listener to open a modal when an image in the gallery is clicked
	for (var i = 0; i < images.length; i += 1) {
		$("#img"+i).click(function() {
			// The index number is the number assigned when the gallery was created (corresponds to the index of the images array in data.js)
			var index = +($(this).attr("index"));
			$("#imageModalLabel").html(images[index].title);

			// Create the carousel for the image(s)
			var src = images[index].src;
			var carousel_html = "";
			for (var j = 0; j < src.length; j += 1) {

				// The first image in the carousel is active
				if (j == 0) {
					carousel_html += "<div class='carousel-item active'>";
				}
				else {
					carousel_html += "<div class='carousel-item'>";
				}

				// If there are multiple images, then have the carousel images be a bit small to show the controls
				// Otherwise, have the carousel image span across the entire width available
				if (src.length > 1) {
					carousel_html += "<img src='"+ src[j] +"' class='d-block img-carousel-responsive' alt='...'>";
				}
				else {
					carousel_html += "<img src='"+ src[j] +"' class='d-block img-responsive' alt='...'>";
				}
				carousel_html += "</div>"
				$("#imageModalImage").html(carousel_html);
			}
			// If there are multiple images, then show the carousel controls and indicators and make the image slightly smaller
			// Otherwise, hide them
			if (src.length > 1) {
				$(".carousel-control-prev").show();
				$(".carousel-control-next").show();
				$(".carousel-indicators").show();
				var indicator_html = "";
				for (var j = 0; j < src.length; j += 1) {
					if (j == 0) {
						indicator_html += "<button type='button' data-bs-target='#modal-carousel' data-bs-slide-to='"+j+"' class='active' aria-current='true' aria-label='Slide "+(j+1)+"'></button>";
					}
					else {
						indicator_html += "<button type='button' data-bs-target='#modal-carousel' data-bs-slide-to='"+j+"' aria-label='Slide "+(j+1)+"'></button>";
					}
				}
				$(".carousel-indicators").html(indicator_html);
				$(".carousel-inner").addClass("carousel-inner-padding");
				$("#imageModalDesc").addClass("imageModalDescPadding");
			}
			else {
				$(".carousel-control-prev").hide();
				$(".carousel-control-next").hide();
				$(".carousel-indicators").hide();
				$(".carousel-inner").removeClass("carousel-inner-padding");
				$("#imageModalDesc").removeClass("imageModalDescPadding");
			}
			$("#imageModalDesc").html(getModalDescText(images[index]));
			enableImageSeriesLinks();
			//enableTooltips();
			$("#imageModal").modal("show", $(this));
		});
	}
	updateImageCountLabel();
}

// Update the image count label
function updateImageCountLabel() {
	var numOfVisibleImages = $(".gallery-img > img:visible").length;
	$("#count").html(numOfVisibleImages);
}

// Map a string to another string
function translateWord(word) {
	var translations = {
		nsfw: "NSFW 🔞"
	};
	if (word in translations) {
		return translations[word];
	}
	else {
		return word;
	}
}

// Create the tags dropdown menu
function createTagsDropdown(tags) {
	// Delete the empty string tag
	tags.delete("");

	tags_to_show = {};

	// Create the dropdown options
	var tags_dropdown_HTML = "";
	tags.forEach (function(value) {
		tags_dropdown_HTML += "<li><label><input type='checkbox' value='"+value+"'> <strong>"+translateWord(value)+"</strong></label></li>"
		tags_to_show[value] = false;
	});
	$("#tags-dropdown").html(tags_dropdown_HTML);

	// By default, hide images with tags
	for (var tag in tags_to_show) {
		$("."+tag).parent().hide();
	}

	// When a checkbox is checked/unchecked in the dropdown menu...
	$(".checkbox-menu").on("change", "input[type='checkbox']", function() {
		var tag = $(this)[0].value;

		// If the tag is "nsfw" and is checked, then ask for 18+ confirmation
		if (tag == "nsfw" && $(this).closest("input").prop("checked")) {
			// The checked property is set to true at this call because clicking on the checkbox causes it to flip checked at this moment
			var nsfw_confirmation = nsfwVerification();
			// Set the checkbox to unchecked if Cancel was selected instead of OK
			if (!nsfw_confirmation) {
				$(this).closest("input").prop("checked", false);
				return false;
			}
		}

		// Mark the tag in the map to true if checked and false if unchecked
		$(this).closest("li").toggleClass("active", this.checked);
		if ($(this).closest("li").hasClass("active")) {
			tags_to_show[tag] = true;
		}
		else {
			tags_to_show[tag] = false;
		}

		// Show only the images that need to be shown (filtering by tags)
		showImagesThatMatch();
	});

	$("#search-bar").on("change keydown paste input", function() {
		// When the search bar is updated, update the filters
		showImagesThatMatch();
	});
}

// When a series link is clicked, then it closes the modal and changes the content and re-opens it with the new image
function enableImageSeriesLinks() {
	$(".series-link").click(function() {
		// This global variable is important so that closing the modal triggers the hide modal event only once
		series_link_clicked = true;
		$("#imageModal").modal("hide");
		series_link_clicked_index = +($(this).attr("index"));
		$("#imageModal").on("hidden.bs.modal", function () {
			if (series_link_clicked) {
				$("#img"+series_link_clicked_index).click();
				series_link_clicked = false;
			}
		});
	});
}

// When a modal is opened, the URL is updated so that when the back button is clicked, the modal is closed.
function backButtonHideModal() {
	// https://stackoverflow.com/questions/40314576/bootstrap-3-close-modal-when-pushing-browser-back-button
	$("div.modal").on("show.bs.modal", function(e) {
		var modal = this;
		var index = +($($(e.relatedTarget)[0]).attr("index"));
		// Handle the case when the About Me modal is opened where its index is -1
		if (index == -1) {
			index = "AboutMe"
		}
		var hash = index
		window.location.hash = hash;
		window.onhashchange = function() {
			if (!location.hash){
				$(modal).modal("hide");
			}
		}
	});
	$("div.modal").on("hidden.bs.modal", function() {
		var hash = this.id;
		history.replaceState("", document.title, window.location.pathname);
	});
	// when close button clicked simulate back
	$("div.modal button.close").on("click", function(){
		window.history.back();
	})
	// when esc pressed when modal open simulate back
	$("div.modal").keyup(function(e) {
		if (e.keyCode == 27){
			window.history.back();
		}
	});
}

// Filters images by tags and search using 'AND' logic.
// The image must have exactly the tags that are specified by the filter
// AND
// The image must also have the search term in one of the fields to be shown.
function showImagesThatMatch() {
	// Get the visible tags in string form
	var visible_tags = [];
	for (var tag_key in tags_to_show) {
		if (tags_to_show[tag_key]) {
			visible_tags.push(tag_key)
		}
	}
	var visible_tags_str = visible_tags.sort().toString();

	// Then compare it with the tags of each image. If they match, then show. Otherwise, hide.
	var images = data.images;
	var search_str = document.getElementById("search-bar").value.toLowerCase();
	for (var i = 0; i < images.length; i++) {
		var tags_str = images[i].tags.sort().toString();
		if (visible_tags_str == tags_str) {
			if (search_str == "") {
				$("#img"+i).show();
			}
			else {
				// The search bar is not empty, so check the data fields for matches
				if (images[i].title.toLowerCase().includes(search_str)
					|| images[i].desc.toLowerCase().includes(search_str)
					|| images[i].artist.toLowerCase().includes(search_str)) {
					$("#img"+i).show();
				}
				else {
					$("#img"+i).hide();
				}
			}
		}
		else {
			$("#img"+i).hide();
		}
	}

	// Hide hidden images no matter what
	$(".hidden-image").hide();

	updateImageCountLabel();
}

function nsfwVerification() {
	if (localStorage.getItem("nsfwVerified") && localStorage.getItem("nsfwVerified") == "verified") {
		return true;
	}
	var nsfw_confirmation = confirm("By clicking OK, you are confirming that you are 18 years or older and are okay with NSFW images being displayed on your screen. Click Cancel if you are not.");
	if (!nsfw_confirmation) {
		localStorage.setItem("nsfwVerified", "notVerified")
		return false;
	}
	else {
		localStorage.setItem("nsfwVerified", "verified")
		return true;
	}
}