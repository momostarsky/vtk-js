import 'vtk.js/favicon';

import vtkFullScreenRenderWindow from 'vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkActor from 'vtk.js/Rendering/Core/Actor';
import vtkColorMaps from 'vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';
import vtkColorTransferFunction from 'vtk.js/Rendering/Core/ColorTransferFunction';
import vtkMapper from 'vtk.js/Rendering/Core/Mapper';
import vtkTexture from 'vtk.js/Rendering/Core/Texture';
import vtkRTAnalyticSource from 'vtk.js/Filters/Sources/RTAnalyticSource';
import vtkImageSliceFilter from 'vtk.js/Filters/General/ImageSliceFilter';
import vtkScalarToRGBA from 'vtk.js/Filters/General/ScalarToRGBA';
import vtkPlaneSource from 'vtk.js/Filters/Sources/PlaneSource';
import vtkPiecewiseFunction from 'vtk.js/Common/DataModel/PiecewiseFunction';

import controller from './controller.html';

// ----------------------------------------------------------------------------
// Standard rendering code setup
// ----------------------------------------------------------------------------

const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
  background: [0.5, 0.5, 0.5],
});
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();

const dataRange = [45, 183];

// ----------------------------------------------------------------------------
// Example code
// ----------------------------------------------------------------------------

const lookupTable = vtkColorTransferFunction.newInstance();
const preset = vtkColorMaps.getPresetByName('erdc_rainbow_bright');
lookupTable.applyColorMap(preset);
lookupTable.setMappingRange(...dataRange);
lookupTable.updateRange();

const piecewiseFunction = vtkPiecewiseFunction.newInstance();
piecewiseFunction.removeAllPoints();
piecewiseFunction.addPoint(dataRange[0], 0);
piecewiseFunction.addPoint((dataRange[0] + dataRange[1]) * 0.5, 0.1);
piecewiseFunction.addPoint(dataRange[1], 1);

const wavelet = vtkRTAnalyticSource.newInstance();
const actor = vtkActor.newInstance();
const mapper = vtkMapper.newInstance();

const sliceFilter = vtkImageSliceFilter.newInstance({ sliceIndex: 10 });
sliceFilter.setInputConnection(wavelet.getOutputPort());

const rgbaFilter = vtkScalarToRGBA.newInstance();
rgbaFilter.setLookupTable(lookupTable);
rgbaFilter.setPiecewiseFunction(piecewiseFunction);
rgbaFilter.setInputConnection(sliceFilter.getOutputPort());

const texture = vtkTexture.newInstance();
texture.setInputConnection(rgbaFilter.getOutputPort());

const planeSource = vtkPlaneSource.newInstance();
mapper.setInputConnection(planeSource.getOutputPort());
actor.setMapper(mapper);
actor.addTexture(texture);

renderer.addActor(actor);
renderer.resetCamera();
renderWindow.render();

// UI slider
fullScreenRenderer.addController(controller);
document.querySelector('.sliceIndex').addEventListener('input', (e) => {
  const sliceIndex = Number(e.target.value);
  sliceFilter.setSliceIndex(sliceIndex);
  texture.modified();
  renderWindow.render();
});
