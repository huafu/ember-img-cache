# ember-img-cache

Never saw some images already loaded by your Ember app re-loading again? Well this addon includes
an `{{img}}` Handlebars helper that will clone images and keep a cache of the nodes, re-cloning the
clone any time later that the application needs that image again, resulting in traffic cut-down
as the browser does not try to download the image again then.


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

1. The first time you call `{{img}}` with a given `src`, if that `src` isn't falsy and isn't starting
with `data:` or `file:`, the image will be injected into the DOM normally, but queued for caching.
2. Once in the `afterRender` Ember's queue, that `<img>` node will be cloned and saved into the cache
3. Later when you use `{{img}}` again with that same `src`, it'll insert a placeholder `<img>` with
no `src` attribute, and queue it for replacement.
4. Once in the `afterRender` Ember's queue, that placeholder `<img>` node will be replaced with a clone
of the cached `<img>`, taking care of copying attributes. **That way the browser will NOT re-download
the image, while if it parses it in some HTML it'd re-download that image.**


## Authors

* ![Huafu Gandon](https://s.gravatar.com/avatar/950590a0d4bc96f4a239cac955112eeb?s=24) [Huafu Gandon](https://github.com/huafu)
