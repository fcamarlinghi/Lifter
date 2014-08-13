/*!
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
    // Start clean and strict
    $.strict = true;
    $.gc();

    // Load libraries
    var _testsFolder = new File($.fileName).parent;
    $.evalFile(_testsFolder + '/../build/debug/lifter.full.js');
    $.evalFile(_testsFolder + '/../src/test/test.js');

    var __documents = Lifter.documents,
        __layers = Lifter.layers;


    // Log test start time
    Lifter.test.print('\nTests started at: ' + new Date());

    // Enumeration tests
    Lifter.test('Enumeration', function (assert)
    {
        var TestEnumeration = function TestEnumeration() { };
        TestEnumeration.FIRST = new Enumerator('TestEnumeration.FIRST', 0);
        TestEnumeration.SECOND = new Enumerator('TestEnumeration.SECOND', 1);

        assert.ok(TestEnumeration.FIRST == TestEnumeration.FIRST, 'Enumerator equality.');
        assert.ok(TestEnumeration.FIRST != TestEnumeration.SECOND, 'Enumerator inequality.');
        assert.ok(TestEnumeration.FIRST === TestEnumeration.FIRST, 'Enumerator strict equality.');
        assert.ok(TestEnumeration.FIRST !== TestEnumeration.SECOND, 'Enumerator strict inequality.');
        assert.ok(TestEnumeration.FIRST < TestEnumeration.SECOND, 'Enumerator minor than.');
        assert.ok(TestEnumeration.FIRST <= TestEnumeration.SECOND, 'Enumerator minor than or equal.');
        assert.fail(TestEnumeration.FIRST > TestEnumeration.SECOND, 'Enumerator greater than.');
        assert.fail(TestEnumeration.FIRST >= TestEnumeration.SECOND, 'Enumerator greater than or equal.');

    });

    // LayerBounds tests
    Lifter.test('LayerBounds', function (assert)
    {
        var TestLayerBounds = new LayerBounds(0, 0, 64, 64);

        assert.ok(this.TestLayerBounds == this.TestLayerBounds, 'LayerBounds equality.');
        assert.fail(this.TestLayerBounds != this.TestLayerBounds, 'TestLayerBounds inequality.');
        assert.ok(this.TestLayerBounds === this.TestLayerBounds, 'Enumerator strict equality.');
        assert.fail(this.TestLayerBounds !== this.TestLayerBounds, 'Enumerator strict inequality.');
    });

    // Document tests
    // Preparation
    __documents.add(32, 32).add(32, 32);

    Lifter.test('Document', function (assert)
    {
        // getCount
        assert.ok(__documents.count() === 2, 'getCount()');

        // getDocumentIdByItemIndex
        assert.ok(__documents.getDocumentIdByItemIndex(2) > 0, 'getDocumentIdByItemIndex.');

        // Add document
        var count = __documents.count();
        __documents.add(32, 32);
        assert.ok(__documents.count() === count + 1, 'add.');

        // Close document
        count = __documents.count();
        __documents.close();
        assert.ok(__documents.count() === count - 1, 'close.');

        // TODO
    });

    // Cleanup
    __documents.close().close();

    // Layers tests
    // Prepare test document
    __documents.add(32, 32);
    __layers.add() // layerId = 2, itemIndex = 2
            .addLayerSet()  // layerId = 3/4, itemIndex = 5/3
            .add(); // layerId = 5, itemIndex = 4

    Lifter.test('Layers', function (assert)
    {
        // getCount
        var count = __layers.count();
        assert.ok(typeof count === 'number' && count === 5, 'getCount()');

        // getLayerIdByItemIndex
        assert.ok(__layers.getLayerIdByItemIndex(2) === 2, 'getLayerIdByItemIndex()');

        // Properties get/set
        // ItemIndex
        assert.ok(function () { return __layers.prop('itemIndex', 1); }, 'prop("itemIndex", 1) on active Layer');
        assert.ok(function () { return __layers.prop('itemIndex') === 2; }, 'prop("itemIndex") on active Layer');
        __layers.prop('itemIndex', 4);

        assert.ok(function () { return __layers.prop(2, 'itemIndex', 4); }, 'prop("itemIndex", 4) on other Layer');
        assert.ok(function () { return __layers.prop(2, 'itemIndex') === 4; }, 'prop("itemIndex") on other Layer');
        __layers.prop(2, 'itemIndex', 1);

        assert.ok(function () { return __layers.prop(3, 'itemIndex', 1); }, 'prop("itemIndex", 1) on LayerSet start');
        assert.ok(function () { return __layers.prop(3, 'itemIndex') === 4; }, 'prop("itemIndex") on LayerSet start');
        assert.ok(function () { return __layers.prop(4, 'itemIndex') === 2; }, 'prop("itemIndex") on LayerSet end');
        __layers.prop(3, 'itemIndex', 5).stack.makeActive(5);

        // Layer ID
        assert.ok(function () { return __layers.prop('layerId') === 5; }, 'prop("layerId") on active Layer');
        assert.ok(function () { return __layers.prop(2, 'layerId') === 2; }, 'prop("layerId") on other Layer');
        assert.ok(function () { return __layers.prop(3, 'layerId') === 3; }, 'prop("layerId") on LayerSet start');
        assert.ok(function () { return __layers.prop(4, 'layerId') === 4; }, 'prop("layerId") on LayerSet end');

        // Name
        __layers.stack.makeActive(5);
        var oldName = __layers.prop('name');
        assert.ok(function () { return __layers.prop('name', 'Test'); }, 'prop("name", "Test") on active Layer');
        assert.ok(function () { return __layers.prop('name') === 'Test'; }, 'prop("name") on active Layer');
        __layers.prop('name', oldName);

        oldName = __layers.prop(2, 'name');
        assert.ok(function () { return __layers.prop(2, 'name', 'Test 2'); }, 'prop("name", "Test 2") on other Layer');
        assert.ok(function () { return __layers.prop(2, 'name') === 'Test 2'; }, 'prop("name") on other Layer');
        __layers.prop(2, 'name', oldName);

        oldName = __layers.prop(3, 'name');
        assert.ok(function () { return __layers.prop(3, 'name', 'Group Test'); }, 'prop("name", "Group Test") on LayerSet start');
        assert.ok(function () { return __layers.prop(3, 'name') === 'Group Test'; }, 'prop("name") on LayerSet start');
        __layers.prop(3, 'name', oldName);

        assert.fail(function () { return __layers.prop(4, 'name', 'Group Test 2'); }, 'prop("name", "Group Test 2") on LayerSet end');
        assert.ok(function () { return __layers.prop(4, 'name') === '</Layer group>'; }, 'prop("name") on LayerSet end');

        // Color
        Enumeration.toArray(LayerColor).forEach(function (element)
        {
            __layers.stack.makeActive(5);
            assert.ok(function () { return __layers.prop('color', element); }, 'prop("color", "' + element.toString() + '") on active Layer');
            assert.ok(function () { return __layers.prop('color') === element; }, 'prop("color") === "' + element.toString() + '" on active Layer');
            __layers.prop('color', LayerColor.NONE);

            assert.ok(function () { return __layers.prop(2, 'color', element); }, 'prop("color", "' + element.toString() + '") on other Layer');
            assert.ok(function () { return __layers.prop(2, 'color') === element; }, 'prop("color") === "' + element.toString() + '" on other Layer');
            __layers.prop(2, 'color', LayerColor.NONE);

            assert.ok(function () { return __layers.prop(3, 'color', element); }, 'prop("color", "' + element.toString() + '") on LayerSet start');
            assert.ok(function () { return __layers.prop(3, 'color') === element; }, 'prop("color") === "' + element.toString() + '" on LayerSet start');
            __layers.prop(3, 'color', LayerColor.NONE);

            assert.fail(function () { return __layers.prop(4, 'color', element); }, 'prop("color", "' + element.toString() + '") on LayerSet end');
            assert.ok(function () { return __layers.prop(4, 'color') === LayerColor.NONE; }, 'prop("color") === "' + element.toString() + '" on LayerSet end');
        });

        // Visible
        __layers.stack.makeActive(5);
        assert.ok(function () { return __layers.prop('visible', false); }, 'prop("visible", false) on active Layer');
        assert.ok(function () { return __layers.prop('visible') === false; }, 'prop("visible") on active Layer');
        __layers.prop('visible', true);

        assert.ok(function () { return __layers.prop(2, 'visible', false); }, 'prop("visible", false) on other Layer');
        assert.ok(function () { return __layers.prop(2, 'visible') === false; }, 'prop("visible") on other Layer');
        __layers.prop(2, 'visible', true);

        assert.ok(function () { return __layers.prop(3, 'visible', false); }, 'prop("visible", false) on LayerSet start');
        assert.ok(function () { return __layers.prop(3, 'visible') === false; }, 'prop("visible") on LayerSet start');
        __layers.prop(3, 'visible', true);

        assert.fail(function () { return __layers.prop(4, 'visible', false); }, 'prop("visible", false) on LayerSet end');
        assert.ok(function () { return __layers.prop(4, 'visible') === true; }, 'prop("visible") on LayerSet end');

        // Opacity
        __layers.stack.makeActive(5);
        assert.ok(function () { return __layers.prop('opacity', 50.0); }, 'prop("opacity", 50.0) on Layer');
        assert.ok(function () { return Math.floor(__layers.prop('opacity')) === 50.0; }, 'prop("opacity") on Layer');
        __layers.prop('opacity', 100.0);

        assert.ok(function () { return __layers.prop(2, 'opacity', 50.0); }, 'prop("opacity", 50.0) on other Layer');
        assert.ok(function () { return Math.floor(__layers.prop(2, 'opacity')) === 50.0; }, 'prop("opacity") on other Layer');
        __layers.prop(2, 'opacity', 100.0);

        assert.ok(function () { return __layers.prop(3, 'opacity', 50.0); }, 'prop("opacity", 50.0) on LayerSet start');
        assert.ok(function () { return Math.floor(__layers.prop(3, 'opacity')) === 50.0; }, 'prop("opacity") on LayerSet start');
        __layers.prop(3, 'opacity', 100.0);

        assert.fail(function () { return __layers.prop(4, 'opacity', 50.0); }, 'prop("opacity", 50.0) on LayerSet end');
        assert.ok(function () { return Math.floor(__layers.prop(4, 'opacity')) === 100.0; }, 'prop("opacity") on LayerSet end');

        // Fill opacity
        __layers.stack.makeActive(5);
        assert.ok(function () { return __layers.prop('fillOpacity', 50.0); }, 'prop("fillOpacity", 50.0) on Layer');
        assert.ok(function () { return Math.floor(__layers.prop('fillOpacity')) === 50.0; }, 'prop("fillOpacity") on Layer');
        __layers.prop('fillOpacity', 100.0);

        assert.ok(function () { return __layers.prop(2, 'fillOpacity', 50.0); }, 'prop("fillOpacity", 50.0) on other Layer');
        assert.ok(function () { return Math.floor(__layers.prop(2, 'fillOpacity')) === 50.0; }, 'prop("fillOpacity") on other Layer');
        __layers.prop(2, 'fillOpacity', 100.0);

        assert.fail(function () { return __layers.prop(3, 'fillOpacity', 50.0); }, 'prop("fillOpacity", 50.0) on LayerSet start');
        assert.ok(function () { return Math.floor(__layers.prop(3, 'fillOpacity')) === 100.0; }, 'prop("fillOpacity") on LayerSet start');

        assert.fail(function () { return __layers.prop(4, 'fillOpacity', 50.0); }, 'prop("fillOpacity", 50.0) on LayerSet end');
        assert.ok(function () { return Math.floor(__layers.prop(4, 'fillOpacity')) === 100.0; }, 'prop("fillOpacity") on LayerSet end');

        // Blend mode
        Enumeration.toArray(LifterBlendMode).forEach(function (element)
        {
            __layers.stack.makeActive(5);
            assert.ok(function () { return __layers.prop('blendMode', element); }, 'prop("blendMode", "' + element.toString() + '") on active Layer');
            if (element !== LifterBlendMode.PASSTHROUGH) // Passthrough is not applied on layers
                assert.ok(function () { return __layers.prop('blendMode') === element; }, 'prop("blendMode) === "' + element.toString() + '" on active Layer');
            __layers.prop('blendMode', LifterBlendMode.NORMAL);

            assert.ok(function () { return __layers.prop(2, 'blendMode', element); }, 'prop("blendMode", "' + element.toString() + '") on other Layer');
            if (element !== LifterBlendMode.PASSTHROUGH) // Passthrough is not applied on layers
                assert.ok(function () { return __layers.prop(2, 'blendMode') === element; }, 'prop("blendMode) === "' + element.toString() + '" on other Layer');
            __layers.prop(2, 'blendMode', LifterBlendMode.NORMAL);

            assert.ok(function () { return __layers.prop(3, 'blendMode', element); }, 'prop("blendMode", "' + element.toString() + '") on LayerSet start');
            assert.ok(function () { return __layers.prop(3, 'blendMode') === element; }, 'prop("blendMode") === "' + element.toString() + '" on LayerSet start');
            __layers.prop(3, 'blendMode', LifterBlendMode.PASSTHROUGH);

            assert.fail(function () { return __layers.prop(4, 'blendMode', element); }, 'prop("blendMode", "' + element.toString() + '") on LayerSet end');
            assert.ok(function () { return __layers.prop(4, 'blendMode') === LifterBlendMode.PASSTHROUGH; }, 'prop("blendMode") === "' + element.toString() + '" on LayerSet end');
        });

        // Type
        assert.ok(function () { return __layers.prop('type') === LayerType.CONTENT; }, 'prop("type") on active Layer');
        assert.ok(function () { return __layers.prop(2, 'type') === LayerType.CONTENT; }, 'prop("type") on other Layer');
        assert.ok(function () { return __layers.prop(3, 'type') === LayerType.SETSTART; }, 'prop("type") on LayerSet start');
        assert.ok(function () { return __layers.prop(4, 'type') === LayerType.SETEND; }, 'prop("type") on LayerSet end');

        // Kind
        assert.ok(function () { return __layers.prop('kind') === LayerKind.NORMAL; }, 'prop("kind") on Layer');
        assert.fail(function () { return __layers.prop(3, 'kind'); }, 'prop("kind") on LayerSet');

        // Bounds
        assert.ok(function () { return __layers.prop('bounds') === new LayerBounds(0, 0, 0, 0); }, 'prop("bounds") on active Layer');
        assert.ok(function () { return __layers.prop(2, 'bounds') === new LayerBounds(0, 0, 0, 0); }, 'prop("bounds") on other Layer');
        assert.ok(function () { return __layers.prop(3, 'bounds') === new LayerBounds(0, 0, __documents.prop('width'), __documents.prop('height')); }, 'prop("bounds") on LayerSet start');
        assert.ok(function () { return __layers.prop(3, 'bounds') === new LayerBounds(0, 0, __documents.prop('width'), __documents.prop('height')); }, 'prop("bounds") on LayerSet end');

        // Group
        assert.ok(function () { return __layers.prop('group') === false; }, 'prop("group") on active Layer');
        assert.ok(function () { return __layers.prop(2, 'group') === false; }, 'prop("group") on other Layer');
        assert.ok(function () { return __layers.prop(3, 'group') === false; }, 'prop("group") on LayerSet start');
        assert.ok(function () { return __layers.prop(4, 'group') === false; }, 'prop("group") on LayerSet end');

        // Layer mask
        assert.ok(function () { return __layers.prop('hasLayerMask') === false; }, 'prop("hasLayerMask") on active Layer with no mask');
        assert.fail(function () { return __layers.prop('layerMaskDensity'); }, 'prop("layerMaskDensity") on active Layer with no mask');
        assert.fail(function () { return __layers.prop('layerMaskFeather'); }, 'prop("layerMaskFeather") on active Layer with no mask');
        assert.ok(function () { return __layers.prop(2, 'hasLayerMask') === false; }, 'prop("hasLayerMask") on other Layer with no mask');
        assert.fail(function () { return __layers.prop(2, 'layerMaskDensity'); }, 'prop("layerMaskDensity") on other Layer with no mask');
        assert.fail(function () { return __layers.prop(2, 'layerMaskFeather'); }, 'prop("layerMaskFeather") on other Layer with no mask');
        assert.ok(function () { return __layers.prop(3, 'hasLayerMask') === false; }, 'prop("hasLayerMask") on LayerSet start with no mask');
        assert.fail(function () { return __layers.prop(3, 'layerMaskDensity'); }, 'prop("layerMaskDensity") on LayerSet start with no mask');
        assert.fail(function () { return __layers.prop(3, 'layerMaskFeather'); }, 'prop("layerMaskFeather") on LayerSet start with no mask');

        __layers.masks.addLayerMask();
        assert.ok(function () { return __layers.prop('hasLayerMask') === true; }, 'prop("hasLayerMask") on active Layer with mask');
        assert.ok(function () { return __layers.prop('layerMaskDensity', 50.0); }, 'prop("layerMaskDensity", 50.0) on active Layer with mask');
        assert.ok(function () { return Math.floor(__layers.prop('layerMaskDensity')) === 50.0; }, 'prop("layerMaskDensity") on active Layer with mask');
        assert.ok(function () { return __layers.prop('layerMaskFeather', 2.0); }, 'prop("layerMaskFeather", 2.0) on active Layer with mask');
        assert.ok(function () { return Math.floor(__layers.prop('layerMaskFeather')) === 2.0; }, 'prop("layerMaskFeather") on active Layer with mask');
        __layers.masks.removeLayerMask();

        __layers.masks.addLayerMask(2);
        assert.ok(function () { return __layers.prop(2, 'hasLayerMask') === true; }, 'prop("hasLayerMask") on other Layer with mask');
        assert.ok(function () { return __layers.prop(2, 'layerMaskDensity', 50.0); }, 'prop("layerMaskDensity", 50.0) on other Layer with mask');
        assert.ok(function () { return Math.floor(__layers.prop(2, 'layerMaskDensity')) === 50.0; }, 'prop("layerMaskDensity") on other Layer with mask');
        assert.ok(function () { return __layers.prop(2, 'layerMaskFeather', 2.0); }, 'prop("layerMaskFeather", 2.0) on other Layer with mask');
        assert.ok(function () { return Math.floor(__layers.prop(2, 'layerMaskFeather')) === 2.0; }, 'prop("layerMaskFeather") on other Layer with mask');
        __layers.masks.removeLayerMask(2);

        // Vector mask
        __layers.stack.makeActive(5);
        assert.ok(function () { return __layers.prop('hasVectorMask') === false; }, 'prop("hasVectorMask") on Layer with no vector mask');
        assert.fail(function () { return __layers.prop('vectorMaskDensity'); }, 'prop("vectorMaskDensity") on Layer with no vector mask');
        assert.fail(function () { return __layers.prop('vectorMaskFeather'); }, 'prop("vectorMaskFeather") on Layer with no vector mask');

        // Filter mask
        __layers.stack.makeActive(5);
        assert.ok(function () { return __layers.prop('hasFilterMask') === false; }, 'prop("hasFilterMask") on Layer with no filter mask');
        assert.fail(function () { return __layers.prop('filterMaskDensity'); }, 'prop("filterMaskDensity") on Layer with no filter mask');
        assert.fail(function () { return __layers.prop('filterMaskFeather'); }, 'prop("filterMaskFeather") on Layer with no filter mask');

        // Lock
        __layers.stack.makeActive(5);
        assert.ok(function () { return __layers.prop('allLocked', true); }, 'prop("allLocked", true) on Layer');
        assert.ok(function () { return __layers.prop('allLocked') === true; }, 'prop("allLocked") on Layer');
        assert.ok(function () { return __layers.prop(3, 'allLocked', true); }, 'prop("allLocked", true) on LayerSet');
        assert.ok(function () { return __layers.prop(3, 'allLocked') === true; }, 'prop("allLocked") on LayerSet');
        __layers.prop('allLocked', false).prop(3, 'allLocked', false);

        __layers.stack.makeActive(5);
        assert.ok(function () { return __layers.prop('pixelsLocked', true); }, 'prop("pixelsLocked", true) on Layer');
        assert.ok(function () { return __layers.prop('pixelsLocked') === true; }, 'prop("pixelsLocked") on Layer');
        assert.fail(function () { return __layers.prop(3, 'pixelsLocked', true); }, 'prop("pixelsLocked", true) on LayerSet');
        assert.ok(function () { return __layers.prop(3, 'pixelsLocked') === false; }, 'prop("pixelsLocked") on LayerSet');
        __layers.prop('pixelsLocked', false);

        __layers.stack.makeActive(5);
        assert.ok(function () { return __layers.prop('positionLocked', true); }, 'prop("positionLocked", true) on Layer');
        assert.ok(function () { return __layers.prop('positionLocked') === true; }, 'prop("positionLocked") on Layer');
        assert.fail(function () { return __layers.prop(3, 'positionLocked', true); }, 'prop("positionLocked", true) on LayerSet');
        assert.ok(function () { return __layers.prop(3, 'positionLocked') === false; }, 'prop("positionLocked") on LayerSet');
        __layers.prop('positionLocked', false);

        __layers.stack.makeActive(5);
        assert.ok(function () { return __layers.prop('transparentPixelsLocked', true); }, 'prop("transparentPixelsLocked", true) on Layer');
        assert.ok(function () { return __layers.prop('transparentPixelsLocked') === true; }, 'prop("transparentPixelsLocked") on Layer');
        assert.fail(function () { return __layers.prop(3, 'transparentPixelsLocked', true); }, 'prop("transparentPixelsLocked", true) on LayerSet');
        assert.ok(function () { return __layers.prop(3, 'transparentPixelsLocked') === false; }, 'prop("transparentPixelsLocked") on LayerSet');
        __layers.prop('transparentPixelsLocked', false);

        // isBackgroundLayer
        __layers.stack.makeActive(5);
        assert.ok(function () { return __layers.prop('isBackgroundLayer') === false; }, 'prop("isBackgroundLayer") on Layer');
        assert.ok(function () { return __layers.prop(3, 'isBackgroundLayer') === false; }, 'prop("isBackgroundLayer") on LayerSet');
        assert.ok(function () { return __layers.prop(1, 'isBackgroundLayer') === true; }, 'prop("isBackgroundLayer") on Background');

        // XMP Metadata
        __layers.stack.makeActive(5);
        assert.ok(function () { return __layers.prop('xmpMetadata'); }, 'prop("xmpMetadata") on Layer');
        assert.ok(function () { return __layers.prop(3, 'xmpMetadata'); }, 'prop("xmpMetadata") on LayerSet');
        assert.ok(function () { return __layers.prop(1, 'xmpMetadata'); }, 'prop("xmpMetadata") on Background');

        // Last Modified
        __layers.stack.makeActive(5);
        assert.ok(function () { return __layers.prop('lastModified') instanceof Date; }, 'prop("lastModified")');

        // Add layer
        var count = __layers.count();
        __layers.add();
        assert.ok(__layers.count() === count + 1, 'add()');

        __layers.add('test_layer');
        assert.ok(__layers.prop('name') === 'test_layer', 'add(name)');

        __layers.add(null, 50.0);
        assert.ok(Math.floor(__layers.prop('opacity')) === 50, 'add(null, opacity)');

        __layers.add(null, null, BlendMode.DISSOLVE);
        assert.ok(LifterBlendMode.toBlendMode(__layers.prop('blendMode')) === BlendMode.DISSOLVE, 'add(null, null, blendMode)');

        __layers.add(null, null, null, LayerColor.RED);
        assert.ok(__layers.prop('color') === LayerColor.RED, 'add(null, null, null, layerColor)');

        // Cleanup
        __layers.remove().remove().remove().remove().remove();

        // Remove layer
        __layers.add();
        var count = __layers.count();
        __layers.remove();
        assert.ok(__layers.count() === count - 1, 'remove().');

        // Add layer set
        var count = __layers.count();
        __layers.addLayerSet();
        assert.ok(__layers.count() === count + 2, 'addLayerSet()');

        __layers.addLayerSet('test_layer_set');
        assert.ok(__layers.prop('name') === 'test_layer_set', 'addLayerSet(name)');

        __layers.addLayerSet(null, 50.0);
        assert.ok(Math.floor(__layers.prop('opacity')) === 50.0, 'addLayerSet(null, opacity)');

        __layers.addLayerSet(null, null, BlendMode.DISSOLVE);
        assert.ok(LifterBlendMode.toBlendMode(__layers.prop('blendMode')) === BlendMode.DISSOLVE, 'addLayerSet(null, null, blendMode)');

        __layers.addLayerSet(null, null, null, LayerColor.RED);
        assert.ok(__layers.prop('color') === LayerColor.RED, 'addLayerSet(null, null, null, layerColor)');

        // Cleanup
        __layers.remove().remove().remove().remove().remove();

        // Remove layer set
        __layers.addLayerSet();
        var count = __layers.count();
        __layers.remove();
        assert.ok(__layers.count() === count - 2, 'remove layer set.');

        // For each
        var i = 0;
        __layers.forEach(function (itemIndex, layerId) { i++; });
        assert.ok(i === __layers.count(), 'forEach()');

        // Stack
        // TODO
    });

    // Cleanup
    __documents.close();

    // Log test end time
    return 'Tests completed at: ' + new Date();
}).call(this);