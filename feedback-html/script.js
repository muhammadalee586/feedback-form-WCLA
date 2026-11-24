

(function () {
  var $ = function (sel) { return document.querySelector(sel); };
  var form = $('#fb');
  // Paste your Google Apps Script web-app URL here (see SETUP.md). Empty = demo mode, nothing is sent.
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbw7rgAOf8jsc61GgcSIywc0QklmxlzEu9vYybLMxHPzK6CyTzGcx06lbpUIVd3FcUPfhw/exec';
  var WORDS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

  
  $('#year').textContent = new Date().getFullYear();

  // / 1. Stars ---------- /
  document.querySelectorAll('.stars').forEach(function (box) {
    var name = box.dataset.name;
    var html = '';
    for (var n = 5; n >= 1; n--) {
      html += '<input type="radio" name="' + name + '" id="' + name + '-' + n + '" value="' + n + '">' +
              '<label for="' + name + '-' + n + '" title="' + n + ' of 5">&#9733;' +
              '<span class="sr-only">' + n + ' stars</span></label>';
    }
    box.setAttribute('role', 'radiogroup');
    box.setAttribute('aria-label', box.dataset.label);
    box.innerHTML = html;
    box.dataset.value = '0';

    box.addEventListener('click', function (e) {
      if (e.target.tagName !== 'INPUT') return;
      var clicked = Number(e.target.value);
      var current = Number(box.dataset.value);
      var next = clicked === current ? clicked - 1 : clicked;
      setStars(box, next);
      if (name === 'overall') {
        $('#overallWord').textContent = WORDS[next];
        if (next) setError('overall', '');
      }
    });
  });

  function setStars(box, value) {
    box.dataset.value = String(value);
    box.querySelectorAll('input').forEach(function (r) { r.checked = Number(r.value) === value; });
  }

  function starValue(name) {
    return Number(document.querySelector('.stars[data-name="' + name + '"]').dataset.value);
  }

  /* ---------- 2. Message counter ---------- */
  var message = $('#message');
  message.addEventListener('input', function () {
    $('#count').textContent = message.value.length;
    setError('message', '');
  });

  /* ---------- 3. Anonymous / reply ---------- */
  var anon = $('#anon');
  var reply = $('#reply');
  function syncContact() {
    $('#contact').hidden = anon.checked;
    if (anon.checked) reply.checked = false;
    $('#emailOpt').textContent = reply.checked ? '(required)' : '(optional)';
  }
  anon.addEventListener('change', syncContact);
  reply.addEventListener('change', syncContact);

  /* ---------- 4. Photos ---------- */
  var photos = [];
  var drop = $('#drop');
  var fileInput = $('#files');

  function addFiles(list) {
    var problem = '';
    Array.prototype.forEach.call(list, function (f) {
      if (f.type.indexOf('image/') !== 0) problem = 'Only image files can be added.';
      else if (f.size > 5 * 1024 * 1024) problem = f.name + ' is larger than 5 MB.';
      else if (photos.length >= 3) problem = 'You can add up to 3 photos.';
      else photos.push({ file: f, url: URL.createObjectURL(f) });
    });
    $('#e-files').textContent = problem;
    drawThumbs();
  }

  function drawThumbs() {
    var box = $('#thumbs');
    box.innerHTML = '';
    photos.forEach(function (p, i) {
      var d = document.createElement('div');
      d.className = 'thumb';
      d.innerHTML = '<img alt="Photo ' + (i + 1) + ' preview"><button type="button" aria-label="Remove photo ' + (i + 1) + '">&times;</button>';
      d.querySelector('img').src = p.url;
      d.querySelector('button').addEventListener('click', function () {
        URL.revokeObjectURL(p.url);
        photos.splice(i, 1);
        drawThumbs();
      });
      box.appendChild(d);
    });
  }

  fileInput.addEventListener('change', function () { addFiles(fileInput.files); fileInput.value = ''; });
  ['dragenter', 'dragover'].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); });
  });
  drop.addEventListener('drop', function (e) { addFiles(e.dataTransfer.files); });

  /* ---------- 5. Copy buttons ---------- */
  document.querySelectorAll('.copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var old = btn.textContent;
      function done() { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = old; }, 1400); }
      try {
        navigator.clipboard.writeText(btn.dataset.copy).then(done, function () { btn.textContent = 'Select text'; });
      } catch (err) { btn.textContent = 'Select text'; }
    });
  });

  /* ---------- 6. Validation ---------- */
  function setError(key, msg) {
    var e = $('#e-' + key);
    if (e) e.textContent = msg;
    var f = $('#f-' + key);
    if (f) f.classList.toggle('bad', !!msg);
  }

  function validate() {
    var first = null;
    function bad(key, msg, el) { setError(key, msg); if (!first) first = el; }

    ['place', 'overall', 'message', 'name', 'email', 'consent'].forEach(function (k) { setError(k, ''); });

    if (!$('#place').value) bad('place', 'Choose the place you visited.', $('#place'));
    if (!starValue('overall')) bad('overall', 'Give an overall rating from 1 to 5 stars.', $('#overall-5'));
    if (message.value.trim().length < 20) bad('message', 'Write at least 20 characters so the team can act on it.', message);

    if (!anon.checked) {
      if (!$('#name').value.trim()) bad('name', 'Enter your name, or choose to send anonymously.', $('#name'));
      var email = $('#email').value.trim();
      if (reply.checked && !email) bad('email', 'Add an email so the team can reply.', $('#email'));
      else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad('email', 'This email address looks incomplete.', $('#email'));
    }
    if (!$('#consent').checked) bad('consent', 'Please tick the box to continue.', $('#consent'));

    if (first) {
      first.focus();
      first.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return false;
    }
    return true;
  }

  /* ---------- 7. Submit ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;

    var d = new Date();
    var ref = 'WCL-' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') +
              '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    var type = form.querySelector('input[name="type"]:checked').value;
    var place = $('#place').value; // form hatne se pehle value le lo
    var rating = starValue('overall');

    var data = new URLSearchParams();
    data.append('ref', ref);
    data.append('type', type);
    data.append('place', place);
    data.append('date', $('#date').value);
    data.append('visitor', $('#visitor').value);
    data.append('group', $('#group').value);
    ['overall', 'clean', 'staff', 'sign', 'access', 'safe', 'value'].forEach(function (k) { data.append(k, starValue(k) || ''); });
    data.append('tags', Array.prototype.map.call(form.querySelectorAll('input[name="tag"]:checked'), function (x) { return x.value; }).join(', '));
    data.append('message', message.value.trim());
    data.append('anonymous', anon.checked ? 'yes' : 'no');
    data.append('name', anon.checked ? '' : $('#name').value.trim());
    data.append('email', anon.checked ? '' : $('#email').value.trim());
    data.append('phone', anon.checked ? '' : $('#phone').value.trim());
    data.append('city', anon.checked ? '' : $('#city').value.trim());
    data.append('reply_requested', reply.checked ? 'yes' : 'no');
    data.append('photos', photos.length);
    data.append('website', form.elements['website'].value);
    if (ENDPOINT) {
      fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', body: data }).catch(function () {});
    }

    $('#formCard').innerHTML =
      '<div class="done">' +
        '<div class="tick" aria-hidden="true">&#10003;</div>' +
        '<h2>Thank you for your feedback</h2>' +
        '<p class="muted">Keep this reference number if you need to follow up.</p>' +
        '<div class="ref">' + ref + '</div>' +
        '<div class="summary">' +
          '<div><span>Type</span><span>' + type + '</span></div>' +
          '<div><span>Place</span><span></span></div>' +
          '<div><span>Rating</span><span>' + rating + ' of 5</span></div>' +
          '<div><span>Photos</span><span>' + photos.length + '</span></div>' +
        '</div>' +
        '<button class="btn" type="button" id="again">Send more feedback</button>' +
      '</div>';
    // Place ka naam textContent se daalte hain taake koi HTML andar na chale
    $('#formCard .summary div:nth-child(2) span:last-child').textContent = place;
    $('#again').addEventListener('click', function () { location.reload(); });
    $('#formCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---------- 8. Clear form ---------- */
  $('#reset').addEventListener('click', function () {
    form.reset();
    document.querySelectorAll('.stars').forEach(function (b) { setStars(b, 0); });
    $('#overallWord').textContent = '';
    $('#count').textContent = '0';
    photos.forEach(function (p) { URL.revokeObjectURL(p.url); });
    photos = [];
    drawThumbs();
    $('#e-files').textContent = '';
    document.querySelectorAll('.err').forEach(function (x) { x.textContent = ''; });
    document.querySelectorAll('.field.bad').forEach(function (x) { x.classList.remove('bad'); });
    syncContact();
  });

  syncContact();
})();
