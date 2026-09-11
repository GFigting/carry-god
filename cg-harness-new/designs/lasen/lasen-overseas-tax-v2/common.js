const pages = [
  ['合规资产看板', '合规资产看板.html', '海外税务管理'],
  ['注册管理', '注册管理-LASEN风格-v3.html'],
  ['VAT 管理', 'VAT管理-LASEN风格-v2.html'],
  ['EPR / PPWR 管理', 'EPR-PPWR管理-LASEN风格-v2.html'],
  ['授权代表管理', '授权代表管理-LASEN风格-v2.html'],
  ['申报管理', '申报管理.html'],
  ['申报原始数据', '申报原始数据.html'],
  ['续费与注销管理', '续费与注销管理.html'],
  ['风险管理', '风险管理.html'],
  ['补税与查税', '补税与查税.html'],
  ['基础数据与配置', '基础数据与配置.html', '配置'],
  ['税款计算规则配置', '税款计算规则配置.html']
];

function initShell(activePage) {
  const sidebar = document.querySelector('[data-sidebar]');
  if (sidebar) {
    let currentGroup = '';
    sidebar.innerHTML = pages.map(page => {
      const group = page[2] || currentGroup;
      const groupHtml = page[2] && page[2] !== currentGroup ? `<li class="menu-group">${page[2]}</li>` : '';
      currentGroup = group;
      return `${groupHtml}<li class="menu-item ${page[0] === activePage ? 'active' : ''}"><a href="${page[1]}">${page[0]}</a></li>`;
    }).join('');
  }

  const crumb = document.querySelector('[data-crumb]');
  if (crumb) crumb.textContent = activePage;

  document.querySelectorAll('[data-toast]').forEach(item => {
    item.addEventListener('click', () => showToast(item.dataset.toast));
  });

  document.querySelectorAll('[data-drawer], [data-modal]').forEach(item => {
    item.addEventListener('click', () => openModal(item.dataset.modal || item.dataset.drawer, item.dataset.detail || ''));
  });

  document.querySelectorAll('[data-tab-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-tab-target]').forEach(node => node.classList.remove('active'));
      document.querySelectorAll('[data-tab-panel]').forEach(node => node.style.display = 'none');
      btn.classList.add('active');
      const panel = document.querySelector(`[data-tab-panel="${btn.dataset.tabTarget}"]`);
      if (panel) panel.style.display = '';
    });
  });
}

function shell(title, subtitle, actions) {
  return `
    <div class="page-header">
      <div>
        <div class="page-title">${title}</div>
        <div class="page-subtitle">${subtitle}</div>
      </div>
      <div class="header-actions">${actions || ''}</div>
    </div>`;
}

function commonFilters(extra) {
  return `
    <div class="toolbar">
      <div class="form-item"><label>主体</label><select class="select"><option>全部主体</option><option>厦门狼森</option><option>厦门狼耀</option><option>厦门狼腾</option></select></div>
      <div class="form-item"><label>国家</label><select class="select"><option>全部国家</option><option>英国</option><option>德国</option><option>法国</option><option>欧盟</option></select></div>
      <div class="form-item"><label>平台</label><select class="select"><option>全部平台</option><option>亚马逊</option><option>独立站</option><option>多平台</option></select></div>
      <div class="form-item"><label>关键字</label><input class="input" placeholder="税号 / 店铺 / 编号"></div>
      ${extra || ''}
      <button class="btn btn-primary" data-toast="已按筛选条件刷新列表">查询</button>
      <button class="btn" data-toast="已重置筛选条件">重置</button>
    </div>`;
}

function tag(text, type) {
  const map = {
    '有效': 'tag-green', '已完成': 'tag-green', '已关闭': 'tag-green', '启用': 'tag-green',
    '即将到期': 'tag-orange', '待审批': 'tag-orange', '待申报': 'tag-orange', '处理中': 'tag-orange', '中': 'tag-orange',
    '已到期': 'tag-red', '待处理': 'tag-red', '高': 'tag-red',
    '无需申报': 'tag-grey', '已注销': 'tag-grey',
    '办理中': 'tag-blue', '低': 'tag-blue',
    '注销中': 'tag-purple', '待归档': 'tag-purple', '待确认': 'tag-purple'
  };
  return `<span class="tag ${type || map[text] || 'tag-blue'}">${text}</span>`;
}

function createModal() {
  if (document.querySelector('#modalMask')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal-mask" id="modalMask">
      <section class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <div class="modal-header">
          <div class="modal-title" id="modalTitle">详情</div>
          <button class="modal-close" type="button" data-close-modal>×</button>
        </div>
        <div class="modal-body" id="modalBody"></div>
        <div class="modal-footer">
          <button class="btn" type="button" data-close-modal>关闭</button>
          <button class="btn btn-primary" type="button" data-toast="已保存当前原型数据">保存</button>
        </div>
      </section>
    </div>
    <div class="toast" id="toast">操作成功</div>`);

  document.querySelectorAll('[data-close-modal]').forEach(btn => btn.addEventListener('click', closeModal));
  document.querySelector('#modalMask').addEventListener('click', event => {
    if (event.target.id === 'modalMask') closeModal();
  });
  document.querySelectorAll('#modalMask [data-toast]').forEach(item => {
    item.addEventListener('click', () => showToast(item.dataset.toast));
  });
}

function openModal(title, detail) {
  createModal();
  document.querySelector('#modalTitle').textContent = title;
  document.querySelector('#modalBody').innerHTML = detail || defaultModalContent(title);
  document.querySelector('#modalMask').classList.add('show');
}

function closeModal() {
  const mask = document.querySelector('#modalMask');
  if (mask) mask.classList.remove('show');
}

function showToast(message) {
  createModal();
  const toast = document.querySelector('#toast');
  toast.textContent = message || '操作成功';
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function defaultModalContent(title) {
  return `
    <div class="form-grid">
      <div class="form-field"><label>资产类型</label><select class="select"><option>VAT</option><option>EPR / PPWR</option><option>包装法</option><option>授权代表</option></select></div>
      <div class="form-field"><label>主体</label><select class="select"><option>厦门狼森</option><option>厦门狼耀</option><option>厦门狼腾</option></select></div>
      <div class="form-field"><label>国家 / 地区</label><select class="select"><option>英国</option><option>德国</option><option>法国</option><option>欧盟</option></select></div>
      <div class="form-field"><label>平台 / 店铺</label><input class="input" value="Amazon UK-01"></div>
      <div class="form-field"><label>服务商</label><input class="input" placeholder="请选择或输入服务商"></div>
      <div class="form-field"><label>服务截止日期</label><input class="input" type="date" value="2027-06-30"></div>
      <div class="form-field"><label>归档附件</label><input class="input" placeholder="证书 / 协议 / 申报回执"></div>
      <div class="form-field"><label>负责人</label><input class="input" value="惠容"></div>
      <div class="form-field" style="grid-column: 1 / -1;"><label>备注</label><textarea class="textarea" placeholder="${title}的补充说明"></textarea></div>
    </div>`;
}
