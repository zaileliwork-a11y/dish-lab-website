document.documentElement.classList.add('js');
const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
if (header && toggle) {
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    header.classList.toggle('menu-open', open);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (header.classList.contains('menu-open')) {
      header.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });
}


const collaboratorDirectory = document.querySelector('.collaborator-directory');
if (collaboratorDirectory) {
  const filters = collaboratorDirectory.querySelector('.collaborator-filters');
  const filterButtons = [...filters.querySelectorAll('[data-filter]')];
  const cards = [...collaboratorDirectory.querySelectorAll('.collaborator-card')];
  const status = collaboratorDirectory.querySelector('.collaborator-results');
  const validFilters = new Set(filterButtons.map(button => button.dataset.filter));
  let activeFilter = 'all';

  const filterFromHash = () => {
    const tag = window.location.hash.slice(1);
    return validFilters.has(tag) ? tag : 'all';
  };
  const applyFilter = (tag, updateUrl = false) => {
    activeFilter = validFilters.has(tag) ? tag : 'all';
    let visibleCount = 0;
    cards.forEach(card => {
      const matches = activeFilter === 'all' || card.dataset.topics.split(' ').includes(activeFilter);
      card.hidden = !matches;
      if (matches) visibleCount += 1;
    });
    filterButtons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.filter === activeFilter));
    });
    const label = filterButtons.find(button => button.dataset.filter === activeFilter).textContent.trim();
    status.textContent = `${visibleCount} collaborator${visibleCount === 1 ? '' : 's'}${activeFilter === 'all' ? '' : ' · ' + label}`;
    if (updateUrl) {
      const fragment = activeFilter === 'all' ? '' : '#' + activeFilter;
      window.history.replaceState(null, '', window.location.pathname + window.location.search + fragment);
    }
  };
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tag = button.dataset.filter;
      applyFilter(tag === activeFilter ? 'all' : tag, true);
    });
  });
  window.addEventListener('hashchange', () => applyFilter(filterFromHash()));
  applyFilter(filterFromHash());
  filters.hidden = false;
}

const legacyPaperLinks = document.querySelector('[data-paper-redirect]');
if (legacyPaperLinks) {
  const paperIds = new Set(legacyPaperLinks.dataset.paperIds.split(' '));
  const redirectLegacyPaper = () => {
    const fragment = window.location.hash.slice(1);
    if (fragment !== 'publications' && !paperIds.has(fragment)) return;
    const destination = new URL(legacyPaperLinks.dataset.paperRedirect, window.location.href);
    destination.hash = fragment === 'publications' ? '' : fragment;
    window.location.replace(destination.href);
  };
  redirectLegacyPaper();
  window.addEventListener('hashchange', redirectLegacyPaper);
}

const publicationDirectory = document.querySelector('.publication-directory');
if (publicationDirectory) {
  const filters = publicationDirectory.querySelector('.publication-filters');
  const typeSelect = filters.querySelector('#publication-type');
  const topicSelect = filters.querySelector('#publication-topic');
  const reset = filters.querySelector('.publication-reset');
  const papers = [...publicationDirectory.querySelectorAll('.publication')];
  const groups = [...publicationDirectory.querySelectorAll('.publication-group')];
  const status = publicationDirectory.querySelector('.publication-results');
  const empty = publicationDirectory.querySelector('.publication-empty');

  const applyFilters = () => {
    let count = 0;
    papers.forEach(paper => {
      const typeMatches = typeSelect.value === 'all' || paper.dataset.type === typeSelect.value;
      const topicMatches = topicSelect.value === 'all' || paper.dataset.topics.split(' ').includes(topicSelect.value);
      paper.hidden = !(typeMatches && topicMatches);
      if (!paper.hidden) count += 1;
    });
    groups.forEach(group => {
      group.hidden = ![...group.querySelectorAll('.publication')].some(paper => !paper.hidden);
    });
    const selected = [typeSelect, topicSelect]
      .filter(select => select.value !== 'all')
      .map(select => select.options[select.selectedIndex].textContent);
    status.textContent = `Showing ${count} of ${papers.length} papers${selected.length ? ' · ' + selected.join(' · ') : ''}`;
    empty.hidden = count !== 0;
    reset.hidden = selected.length === 0;
  };
  const clearFilters = () => {
    typeSelect.value = 'all';
    topicSelect.value = 'all';
    applyFilters();
  };
  typeSelect.addEventListener('change', applyFilters);
  topicSelect.addEventListener('change', applyFilters);
  reset.addEventListener('click', () => {
    clearFilters();
    typeSelect.focus();
  });
  window.addEventListener('hashchange', () => {
    const target = papers.find(paper => '#' + paper.id === window.location.hash);
    if (target && target.hidden) {
      clearFilters();
      target.scrollIntoView();
    }
  });
  clearFilters();
  filters.hidden = false;
  status.hidden = false;
}
