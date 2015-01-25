# ember-img-cache [![Build Status](https://travis-ci.org/huafu/ember-img-cache.svg)](https://travis-ci.org/huafu/ember-img-cache)

# DEPRECATED, use [ember-img-manager](https://github.com/huafu/ember-img-manager) instead!

Never saw some images already loaded by your Ember app re-loading again? Well this addon includes
an `{{img}}` Handlebars helper that will clone images and keep a cache of the nodes, re-cloning the
clone any time later that the application needs that image again, resulting in traffic cut-down
as the browser does not try to download the image again then.

As well as caching images, it allow you to have different styles for each `loading`/`success`/`error`
state of an image. Any loading image will be added the `-eic-loading` css class. Once loaded, this
class is removed and `-eic-success` class is added. If it couldn't load the image, the `-eic-error`
class is added instead. **Notice the prefixing dash (`-`)**


## Installation

* `npm install --save-dev ember-img-cache`
* Then in your templates instead of using `<img src="..." ...>`, use the `{{img}}` Handlebars template:
    
    ```handlebars
    <div>
      {{! ... }}
      
      Click here {{img 'assets/images/save.png' alt='Save' title='Save'}} to save!
      
      {{! ... }}
    </div>
    ```
    
    
## How it works

1. When you call `{{img}}` with a given `src`, if that `src` isn't falsy and isn't starting
with `data:` or `file:`, a new template node will be created in the cache if there isn't already.
A placeholder `<img>` tag with all same attributes except an empty `src` will be inserted into the DOM.

2. Once in the `afterRender` Ember's queue, that placeholder `<img>` node will be replaced with a clone
of the cached `<img>`, taking care of copying attributes. **That way the browser will NOT re-download
the image, while if it parses it in some HTML it'd re-download that image.**


## Authors

* ![Huafu Gandon](https://s.gravatar.com/avatar/950590a0d4bc96f4a239cac955112eeb?s=24) [Huafu Gandon](https://github.com/huafu)
