DISPATCH.pane("schedule-failed", `
  <main>
    <div class="lead">
      <h1>Schedule Failed</h1>
    </div>

    <div class="sf-panel" id="sf-fp">
      <div class="sf-hd">
        <h2>File</h2>
        <span class="sf-meta" id="sf-cnt">0 / 2 wajib</span>
      </div>
      <div class="sf-bd">
        <div class="sf-drop" id="sf-drop">
          <strong>Tarik file ke sini, atau telusuri</strong>
          <span>dikenali dari isi kolomnya · nama file bebas</span>
        </div>

        <div class="sf-slot">
          <span class="sf-tag">Dispatching</span>
          <span class="sf-name" id="sf-n-dsp">export Dispatching .xlsx</span>
          <button class="sf-pick" data-k="dsp">Pilih</button>
        </div>
        <div class="sf-slot">
          <span class="sf-tag">Inprogress</span>
          <span class="sf-name" id="sf-n-inp">export Inprogress .xlsx</span>
          <button class="sf-pick" data-k="inp">Pilih</button>
        </div>
        <div class="sf-slot">
          <span class="sf-tag">Output lama</span>
          <span class="sf-name" id="sf-n-prv">SCHEDULE FAILED sebelumnya, opsional · untuk update</span>
          <button class="sf-pick" data-k="prv">Pilih</button>
        </div>

        <div class="actions">
          <button class="btn btn-primary" id="sf-run" disabled>Proses</button>
        </div>
        <div id="sf-e1"></div>
      </div>
    </div>

    <div class="sf-panel sf-hidden" id="sf-res">
      <div class="sf-hd">
        <h2>Hasil</h2>
        <span class="sf-meta" id="sf-meta"></span>
      </div>
      <div class="sf-bd">
        <div id="sf-alerts"></div>
        <div class="sf-tally" id="sf-tally"></div>
        <div class="sf-pv" id="sf-pv"></div>
        <div class="sf-note" id="sf-pnote"></div>
        <div class="actions">
          <button class="btn btn-primary" id="sf-save">Download</button>
        </div>
        <div id="sf-e2"></div>
      </div>
    </div>

    <input type="file" id="sf-fi" accept=".xlsx,.xls" multiple>
  </main>
`);
