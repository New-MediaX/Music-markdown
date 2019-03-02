'use strict';

// jest.mock('./chord_diagram.js');

const Chord = require('../parsers/chord.js');

const rewire = require('rewire');
const chordsrendererjs = rewire('./chords_renderer.js');
chordsrendererjs.__set__('document', document);
chordsrendererjs.__get__('chordDiagram').renderChordDiagram = jest.fn(() => 'svg_here');

const createHtmlChordChart = chordsrendererjs.__get__('createHtmlChordChart');
const createListOfWrappedVoices = chordsrendererjs.__get__('createListOfWrappedVoices');
const appendVoiceContentDiv = chordsrendererjs.__get__('appendVoiceContentDiv');
const VoiceColors = chordsrendererjs.__get__('VoiceColors');

const svgDiagramDiv = '<div class="diagram">svg_here</div>';

describe('JSON to HTML converter', () => {
  const defaultColors = ['blue', 'black', 'red', 'green', 'purple', 'teal'];

  test('should wrap voice in div', () => {
    const parentDiv = document.createElement('div');
    appendVoiceContentDiv(parentDiv, 'The', 1, 'c1');

    const expectedDiv = `<div><div> </div><div class="c1 chord">${svgDiagramDiv}The</div></div>`;

    expect(parentDiv.outerHTML).toEqual(expectedDiv);
  });

  test('should not include spaces div if there is no expected whitespace', () => {
    const parentDiv = document.createElement('div');
    appendVoiceContentDiv(parentDiv, new Chord('C'), 0, 'c1');

    const expectedDiv = `<div><div class="c1 chord">${svgDiagramDiv}C</div></div>`;

    expect(parentDiv.outerHTML).toEqual(expectedDiv);
  });

  test('should append several chords to same parent div', () => {
    const parentDiv = document.createElement('div');
    appendVoiceContentDiv(parentDiv, new Chord('C'), 0, 'c1');
    appendVoiceContentDiv(parentDiv, new Chord('G'), 5, 'c1');

    const expectedDiv = `<div>` +
      `<div class="c1 chord">${svgDiagramDiv}C</div>` +
      `<div>     </div><div class="c1 chord">${svgDiagramDiv}G</div>` +
    `</div>`;

    expect(parentDiv.outerHTML).toEqual(expectedDiv);
  });

  describe('wrapped voices', () => {
    let voiceColors;
    beforeEach(() => {
      voiceColors = new VoiceColors();
    });

    test('should convert a list of voice events (a chord chard) to wrapped divs', () => {
      const chordChartJson = new Map([
        ['c1', [
          { index: 4, content: new Chord('G') },
          { index: 12, content: new Chord('F') },
          { index: 20, content: new Chord('Am') },
          { index: 29, content: new Chord('G') },
          { index: 40, content: new Chord('F') },
          { index: 47, content: new Chord('C') },
        ]],
        ['c2', [
          { index: 4, content: new Chord('C') },
          { index: 12, content: new Chord('D') },
          { index: 20, content: new Chord('Cm') },
          { index: 29, content: new Chord('F') },
          { index: 40, content: new Chord('G') },
          { index: 47, content: new Chord('B') },
        ]],
        ['l1', [
          { index: 0, content: 'The' },
          { index: 4, content: 'longest' },
          { index: 12, content: 'word' },
          { index: 17, content: 'is' },
          { index: 20, content: 'supercalifragilisticexpialidocious' },
        ]],
        ['l2', [
          { index: 40, content: 'supercalifragilisticexpialidocious' },
        ]],
        ['a1', [
          { index: 4, content: 'crash!' },
        ]]
      ]);

      const expectedChordChartHtmlList = [
        `<div class="voice" style="color: ${defaultColors[0]};">` +
          `<div>    </div><div class="c1 chord">${svgDiagramDiv}G</div>` +
          `<div>       </div><div class="c1 chord">${svgDiagramDiv}F</div>` +
          `<div>       </div><div class="c1 chord">${svgDiagramDiv}Am</div>` +
          `<div>       </div><div class="c1 chord">${svgDiagramDiv}G</div>` +
          `<div>          </div><div class="c1 chord">${svgDiagramDiv}F</div>` +
          `<div>      </div><div class="c1 chord">${svgDiagramDiv}C</div>` +
        '</div>',

        `<div class="voice" style="color: ${defaultColors[1]};">` +
          `<div>    </div><div class="c2 chord">${svgDiagramDiv}C</div>` +
          `<div>       </div><div class="c2 chord">${svgDiagramDiv}D</div>` +
          `<div>       </div><div class="c2 chord">${svgDiagramDiv}Cm</div>` +
          `<div>       </div><div class="c2 chord">${svgDiagramDiv}F</div>` +
          `<div>          </div><div class="c2 chord">${svgDiagramDiv}G</div>` +
          `<div>      </div><div class="c2 chord">${svgDiagramDiv}B</div>` +
        '</div>',

        `<div class="voice" style="color: ${defaultColors[2]};">` +
          '<div class="l1">The</div>' +
          '<div> </div><div class="l1">longest</div>' +
          '<div> </div><div class="l1">word</div>' +
          '<div> </div><div class="l1">is</div>' +
          '<div> </div><div class="l1">supercalifragilisticexpialidocious</div>' +
        '</div>',

        `<div class="voice" style="color: ${defaultColors[3]};">` +
          '<div>                                        </div>' +
          '<div class="l2">supercalifragilisticexpialidocious</div>' +
        '</div>',
        `<div class="voice" style="color: ${defaultColors[4]};">` +
          '<div>    </div><div class="a1">crash!</div>' +
        '</div>'
      ];

      const actualHtmlList = createListOfWrappedVoices(chordChartJson, undefined, voiceColors)
        .map((html) => html.outerHTML);

      expect(actualHtmlList).toEqual(expectedChordChartHtmlList);
    });

    test('should transpose a chord if transpose is provided', () => {
      const phrase = new Map([
        ['c1', [{ index: 0, content: new Chord('C') }]]
      ]);

      const expectedPhraseHtml = [
        `<div class="voice" style="color: ${defaultColors[0]};">` +
          `<div class="c1 chord">${svgDiagramDiv}C#</div>` +
        '</div>'
      ];

      const wrappedVoices = createListOfWrappedVoices(phrase, 1, voiceColors)
        .map((html) => html.outerHTML);

      expect(wrappedVoices).toEqual(expectedPhraseHtml);
    });

    test('should not try to transpose anything that is not a chord', () => {
      const phrase = new Map([
        ['l1', [{ index: 0, content: 'test' }]]
      ]);

      const expectedPhraseHtml = [
        `<div class="voice" style="color: ${defaultColors[0]};">` +
          '<div class="l1">test</div>' +
        '</div>'
      ];

      const wrappedVoices = createListOfWrappedVoices(phrase, 1, voiceColors)
        .map((html) => html.outerHTML);

      expect(wrappedVoices).toEqual(expectedPhraseHtml);
    });
  });

  test('should wrap a chord chart in chord chart class div', () => {
    const shortChart = [
      new Map([['l1', [{ index: 0, content: 'short' }]]])
    ];

    const expectedChordChartHtml = '<div class="chart">' +
      '<div class="verse">' +
        `<div class="voice" style="color: ${defaultColors[0]};">` +
        '<div class="l1">short</div>' +
      '</div></div></div>';

    expect(createHtmlChordChart(shortChart).outerHTML).toEqual(expectedChordChartHtml);
  });

  test('should separate each verse into their own wrapped div', () => {
    const verse = [
      new Map([
        ['c1', [
          { index: 0, content: new Chord('C') },
          { index: 4, content: new Chord('G') },
        ]],
        ['l1', [
          { index: 0, content: 'Test' }
        ]]
      ]),
      new Map([
        ['c1', [
          { index: 0, content: new Chord('A') },
        ]],
        ['l1', [
          { index: 0, content: 'Song' }
        ]]
      ])
    ];

    const expectedDiv =
      '<div class="chart">' +
        '<div class="verse">' +
          `<div class="voice" style="color: ${defaultColors[0]};">` +
            `<div class="c1 chord">${svgDiagramDiv}C</div>` +
            `<div>   </div><div class="c1 chord">${svgDiagramDiv}G</div>` +
          '</div>' +
          `<div class="voice" style="color: ${defaultColors[1]};">` +
            '<div class="l1">Test</div>' +
          '</div>' +
        '</div>' +
        '<div class="verse">' +
          `<div class="voice" style="color: ${defaultColors[0]};">` +
            `<div class="c1 chord">${svgDiagramDiv}A</div>` +
          '</div>' +
          `<div class="voice" style="color: ${defaultColors[1]};">` +
            '<div class="l1">Song</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    expect(createHtmlChordChart(verse).outerHTML).toEqual(expectedDiv);
  });

  test('should get default colors for first voices', () => {
    const voiceColors = new VoiceColors();

    defaultColors.forEach((color) => {
      expect(voiceColors.getVoiceColor(color)).toEqual(color);
    });
  });

  test('should get random color after defaults expire', () => {
    const voiceColors = new VoiceColors();

    defaultColors.forEach((color) => {
      voiceColors.getVoiceColor(color);
    });

    expect(voiceColors.getVoiceColor('new')).toBeDefined();
  });

  test('should get the same random color after defaults expire', () => {
    const firstVoiceColors = new VoiceColors();
    const secondVoiceColors = new VoiceColors();

    defaultColors.forEach((color) => {
      firstVoiceColors.getVoiceColor(color);
      secondVoiceColors.getVoiceColor(color);
    });

    expect(firstVoiceColors.getVoiceColor('one')).toEqual(secondVoiceColors.getVoiceColor('two'));
  });
});
