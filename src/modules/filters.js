/**
 * Copyright 2014 Francesco Camarlinghi
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * 	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

; (function ()
{
    var filters = {};

    /** 
     * Provides access to blur filters.
     */
    filters.blur = {};

    /** 
     * Applies the Blur filter to the currently active layer or selection.
     * @return Chained reference to filter utilities.
     */
    filters.blur.blur = function ()
    {
        executeAction(c2id('Blr '), undefined, _dialogModesNo);
        return filters;
    };

    /** 
     * Applies the Blur More filter to the currently active layer or selection.
     * @return Chained reference to filter utilities.
     */
    filters.blur.blurMore = function ()
    {
        executeAction(c2id('BlrM'), undefined, _dialogModesNo);
        return filters;
    };

    /** 
     * Applies the Gaussian Blur filter to the currently active layer or selection.
     * @param {Number} [radius=1.0] Gaussian Blur radius.
     * @return Chained reference to filter utilities.
     */
    filters.blur.gaussianBlur = function (radius)
    {
        var desc = new ActionDescriptor();
        desc.putUnitDouble(c2id('Rds '), c2id('#Pxl'), +radius || 1.0);
        executeAction(c2id('GsnB'), desc, DialogModes.NO);
        return filters;
    };


    /** 
     * Provides access to sharpen filters.
     */
    filters.sharpen = {};

    /** 
     * Applies the Sharpen filter to the currently active layer or selection.
     * @return Chained reference to filter utilities.
     */
    filters.sharpen.sharpen = function ()
    {
        executeAction(c2id('Shrp'), undefined, _dialogModesNo);
        return filters;
    };

    /** 
     * Applies the Sharpen Edges filter to the currently active layer or selection.
     * @return Chained reference to filter utilities.
     */
    filters.sharpen.sharpenEdges = function ()
    {
        executeAction(c2id('ShrE'), undefined, _dialogModesNo);
        return filters;
    };

    /** 
     * Applies the Sharpen More filter to the currently active layer or selection.
     * @return Chained reference to filter utilities.
     */
    filters.sharpen.sharpenMore = function ()
    {
        executeAction(c2id('ShrM'), undefined, _dialogModesNo);
        return filters;
    };


    /** 
     * Provides access to procedural rendering filters.
     */
    filters.render = {};

    /** 
     * Applies the Cloud filter to the currently active layer or selection.
     * @return Chained reference to filter utilities.
     */
    filters.render.clouds = function ()
    {
        executeAction(c2id('Clds'), new ActionDescriptor(), _dialogModesNo);
        return filters;
    };

    // Public API
    /**
    * Contains low-level methods to work with filters without accessing Photoshop DOM.
    */
    Lifter.filters = filters;
}());