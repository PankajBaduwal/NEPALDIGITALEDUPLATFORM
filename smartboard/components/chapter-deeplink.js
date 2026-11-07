/**
 * Chapter deep link (used by the PiyushDhara simulation catalogue):
 *   index.html?curriculum=grade-10&subject=science&chapter=3
 * Opens the board on that subject and chapter with its interactive tools panel.
 * Additive: does nothing when the parameters are absent or do not match the curriculum.
 */
(function () {
  'use strict';
  var params;
  try { params = new URLSearchParams(window.location.search); } catch (e) { return; }
  var subject = params.get('subject');
  var chapter = params.get('chapter');
  if (!subject || !chapter || !/^\d{1,3}$/.test(chapter)) return;

  function known() {
    var data = window.CURRICULUM_DATA || (typeof CURRICULUM_DATA !== 'undefined' ? CURRICULUM_DATA : null);
    if (!data || !data.subjects) return subject === 'mathematics' || subject === 'science';
    var curriculum = params.get('curriculum');
    return data.subjects.some(function (s) {
      return s.id === subject && s.active && (!curriculum || s.classId === curriculum) &&
        (s.chapters || []).some(function (c) { return String(c.id) === chapter; });
    });
  }

  function apply() {
    if (!window.App || typeof App.selectChapter !== 'function' || !known()) return;
    if (typeof App.switchSubject === 'function') App.switchSubject(subject);
    App.selectChapter(chapter);
  }

  // After App.init has built the board (and any restored session has been applied)
  if (document.readyState === 'complete') setTimeout(apply, 400);
  else window.addEventListener('load', function () { setTimeout(apply, 400); });
})();
