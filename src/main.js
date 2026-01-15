import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'


let currentTree = null

// Карта расширений для подсветки синтаксиса
const EXTENSION_MAP = {
	'.c': 'cpp',
	'.cpp': 'cpp',
	'.cc': 'cpp',
	'.c++': 'cpp',
	'.cp': 'cpp',
	'.cxx': 'cpp',
	'.h': 'cpp',
	'.h++': 'cpp',
	'.hh': 'cpp',
	'.hpp': 'cpp',
	'.hxx': 'cpp',
	'.inc': 'cpp',
	'.inl': 'cpp',
	'.ipp': 'cpp',
	'.tcc': 'cpp',
	'.tpp': 'cpp',
	'.cats': 'cpp',
	'.idc': 'cpp',
	'.w': 'cpp',
	'.cs': 'csharp',
	'.cake': 'csharp',
	'.cshtml': 'csharp',
	'.csx': 'csharp',
	'.java': 'java',
	'.class': 'java',
	'.jar': 'java',
	'.py': 'python',
	'.pyw': 'python',
	'.pyx': 'python',
	'.pxd': 'python',
	'.pxi': 'python',
	'.bzl': 'python',
	'.cgi': 'python',
	'.fcgi': 'python',
	'.gyp': 'python',
	'.lmi': 'python',
	'.pyde': 'python',
	'.pyp': 'python',
	'.pyt': 'python',
	'.rpy': 'python',
	'.tac': 'python',
	'.wsgi': 'python',
	'.xpy': 'python',
	'.pytb': 'python',
	'.js': 'javascript',
	'._js': 'javascript',
	'.bones': 'javascript',
	'.es': 'javascript',
	'.es6': 'javascript',
	'.frag': 'javascript',
	'.gs': 'javascript',
	'.jake': 'javascript',
	'.jsb': 'javascript',
	'.jscad': 'javascript',
	'.jsfl': 'javascript',
	'.jsm': 'javascript',
	'.jss': 'javascript',
	'.njs': 'javascript',
	'.pac': 'javascript',
	'.sjs': 'javascript',
	'.ssjs': 'javascript',
	'.xsjs': 'javascript',
	'.xsjslib': 'javascript',
	'.ts': 'typescript',
	'.cts': 'typescript',
	'.mts': 'typescript',
	'.rb': 'ruby',
	'.builder': 'ruby',
	'.gemspec': 'ruby',
	'.god': 'ruby',
	'.irbrc': 'ruby',
	'.jbuilder': 'ruby',
	'.mspec': 'ruby',
	'.pluginspec': 'ruby',
	'.podspec': 'ruby',
	'.rabl': 'ruby',
	'.rake': 'ruby',
	'.rbuild': 'ruby',
	'.rbw': 'ruby',
	'.rbx': 'ruby',
	'.ru': 'ruby',
	'.ruby': 'ruby',
	'.thor': 'ruby',
	'.watchr': 'ruby',
	'.php': 'php',
	'.aw': 'php',
	'.ctp': 'php',
	'.php3': 'php',
	'.php4': 'php',
	'.php5': 'php',
	'.phps': 'php',
	'.phpt': 'php',
	'.phtml': 'php',
	'.go': 'go',
	'.rs': 'rust',
	'.rsh': 'rust',
	'.rs.in': 'rust',
	'.swift': 'swift',
	'.kt': 'kotlin',
	'.ktm': 'kotlin',
	'.kts': 'kotlin',
	'.scala': 'scala',
	'.sbt': 'scala',
	'.sc': 'scala',
	'.hs': 'haskell',
	'.hsc': 'haskell',
	'.lhs': 'haskell',
	'.fs': 'fsharp',
	'.fsi': 'fsharp',
	'.fsx': 'fsharp',
	'.ml': 'ocaml',
	'.eliom': 'ocaml',
	'.eliomi': 'ocaml',
	'.ml4': 'ocaml',
	'.mli': 'ocaml',
	'.mll': 'ocaml',
	'.mly': 'ocaml',
	'.erl': 'erlang',
	'.escript': 'erlang',
	'.hrl': 'erlang',
	'.xrl': 'erlang',
	'.yrl': 'erlang',
	'.ex': 'elixir',
	'.exs': 'elixir',
	'.eex': 'elixir',
	'.clj': 'clojure',
	'.boot': 'clojure',
	'.cl2': 'clojure',
	'.cljc': 'clojure',
	'.cljs': 'clojure',
	'.cljs.hl': 'clojure',
	'.cljscm': 'clojure',
	'.cljx': 'clojure',
	'.hic': 'clojure',
	'.lisp': 'lisp',
	'.asd': 'lisp',
	'.cl': 'lisp',
	'.l': 'lisp',
	'.lsp': 'lisp',
	'.ny': 'lisp',
	'.podsl': 'lisp',
	'.sexp': 'lisp',
	'.scm': 'scheme',
	'.sld': 'scheme',
	'.sls': 'scheme',
	'.sps': 'scheme',
	'.ss': 'scheme',
	'.rkt': 'racket',
	'.rktd': 'racket',
	'.rktl': 'racket',
	'.scrbl': 'racket',
	'.asm': 'x86asm',
	'.a51': 'x86asm',
	'.nasm': 'x86asm',
	'.s': 'x86asm',
	'.ms': 'x86asm',
	'.f90': 'fortran',
	'.f': 'fortran',
	'.f03': 'fortran',
	'.f08': 'fortran',
	'.f77': 'fortran',
	'.f95': 'fortran',
	'.for': 'fortran',
	'.fpp': 'fortran',
	'.d': 'd',
	'.di': 'd',
	'.cob': 'cobol',
	'.cbl': 'cobol',
	'.ccp': 'cobol',
	'.cobol': 'cobol',
	'.cpy': 'cobol',
	'.pas': 'pascal',
	'.dfm': 'pascal',
	'.dpr': 'pascal',
	'.lpr': 'pascal',
	'.pp': 'pascal',
	'.adb': 'ada',
	'.ada': 'ada',
	'.ads': 'ada',
	'.pl': 'perl',
	'.al': 'perl',
	'.perl': 'perl',
	'.ph': 'perl',
	'.plx': 'perl',
	'.pm': 'perl',
	'.pod': 'perl',
	'.psgi': 'perl',
	'.t': 'perl',
	'.6pl': 'perl',
	'.6pm': 'perl',
	'.nqp': 'perl',
	'.p6': 'perl',
	'.p6l': 'perl',
	'.p6m': 'perl',
	'.pl6': 'perl',
	'.pm6': 'perl',
	'.sh': 'bash',
	'.bash': 'bash',
	'.bats': 'bash',
	'.command': 'bash',
	'.ksh': 'bash',
	'.sh.in': 'bash',
	'.tmux': 'bash',
	'.tool': 'bash',
	'.zsh': 'bash',
	'.ps1': 'powershell',
	'.psd1': 'powershell',
	'.psm1': 'powershell',
	'.lua': 'lua',
	'.nse': 'lua',
	'.pd_lua': 'lua',
	'.rbxs': 'lua',
	'.wlua': 'lua',
	'.tcl': 'tcl',
	'.adp': 'tcl',
	'.tm': 'tcl',
	'.awk': 'awk',
	'.auk': 'awk',
	'.gawk': 'awk',
	'.mawk': 'awk',
	'.nawk': 'awk',
	'.bat': 'dos',
	'.cmd': 'dos',
	'.html': 'html',
	'.htm': 'html',
	'.html.hl': 'html',
	'.st': 'html',
	'.xht': 'html',
	'.xhtml': 'html',
	'.css': 'css',
	'.scss': 'scss',
	'.sass': 'scss',
	'.less': 'less',
	'.styl': 'stylus',
	'.json': 'json',
	'.geojson': 'json',
	'.lock': 'json',
	'.topojson': 'json',
	'.json5': 'json',
	'.jsonld': 'json',
	'.xml': 'xml',
	'.rss': 'xml',
	'.svg': 'xml',
	'.yml': 'yaml',
	'.yaml': 'yaml',
	'.toml': 'ini',
	'.csv': 'plaintext',
	'.ini': 'ini',
	'.cfg': 'ini',
	'.prefs': 'ini',
	'.pro': 'ini',
	'.properties': 'ini',
	'.dockerfile': 'dockerfile',
	'.mak': 'makefile',
	'.mk': 'makefile',
	'.mkfile': 'makefile',
	'.md': 'markdown',
	'.markdown': 'markdown',
	'.mkd': 'markdown',
	'.mkdn': 'markdown',
	'.mkdown': 'markdown',
	'.ron': 'markdown',
	'.rst': 'markdown',
	'.asciidoc': 'asciidoc',
	'.adoc': 'asciidoc',
	'.asc': 'asciidoc',
	'.tex': 'latex',
	'.aux': 'latex',
	'.bbx': 'latex',
	'.bib': 'latex',
	'.cbx': 'latex',
	'.cls': 'latex',
	'.dtx': 'latex',
	'.ins': 'latex',
	'.lbx': 'latex',
	'.ltx': 'latex',
	'.mkii': 'latex',
	'.mkiv': 'latex',
	'.mkvi': 'latex',
	'.sty': 'latex',
	'.toc': 'latex',
}

function getIcon(name, isDir, isOpen = false) {
	if (isDir) {
		return isOpen
			? '<i class="codicon codicon-folder-opened"></i>'
			: '<i class="codicon codicon-folder"></i>'
	}

	const ext = name.split('.').pop().toLowerCase()

	// Карта расширений к иконкам VS Code
	const iconMap = {
		js: 'symbol-method',
		jsx: 'symbol-method',
		ts: 'symbol-method',
		tsx: 'symbol-method',
		json: 'json',
		html: 'code',
		htm: 'code',
		css: 'symbol-color',
		scss: 'symbol-color',
		sass: 'symbol-color',
		less: 'symbol-color',
		py: 'symbol-class',
		rb: 'ruby',
		java: 'symbol-class',
		c: 'symbol-misc',
		cpp: 'symbol-misc',
		h: 'symbol-misc',
		hpp: 'symbol-misc',
		cs: 'symbol-namespace',
		go: 'symbol-method',
		rs: 'symbol-misc',
		php: 'symbol-method',
		swift: 'symbol-method',
		kt: 'symbol-method',
		md: 'markdown',
		txt: 'file',
		yml: 'symbol-key',
		yaml: 'symbol-key',
		xml: 'code',
		svg: 'file-media',
		png: 'file-media',
		jpg: 'file-media',
		jpeg: 'file-media',
		gif: 'file-media',
		ico: 'file-media',
		pdf: 'file-pdf',
		zip: 'file-zip',
		rar: 'file-zip',
		tar: 'file-zip',
		gz: 'file-zip',
		gitignore: 'source-control',
		git: 'source-control',
		env: 'gear',
		sh: 'terminal',
		bash: 'terminal',
		bat: 'terminal',
		cmd: 'terminal',
		sql: 'database',
		db: 'database',
		lock: 'lock',
		config: 'settings-gear',
		conf: 'settings-gear',
		ini: 'settings-gear',
		toml: 'settings-gear',
		dockerfile: 'server',
		docker: 'server',
		log: 'output',
	}

	const iconClass = iconMap[ext] || 'file'
	return `<i class="codicon codicon-${iconClass}"></i>`
}


function createTreeItem(node, level = 0) {
	const item = document.createElement('div')
	item.style.marginLeft = `${level * 20}px`

	const header = document.createElement('div')
	header.className = 'tree-item'

	if (node.is_dir) {
		const arrow = document.createElement('span')
		arrow.className = 'tree-arrow'
		arrow.textContent = '▶'
		header.appendChild(arrow)

		const icon = document.createElement('span')
		icon.className = 'tree-icon'
		icon.innerHTML = getIcon(node.name, true, false)
		header.appendChild(icon)

		const label = document.createElement('span')
		label.textContent = node.name
		header.appendChild(label)

		const children = document.createElement('div')
		children.className = 'tree-children'

		if (node.children) {
			node.children.forEach(child => {
				children.appendChild(createTreeItem(child, level + 1))
			})
		}

		header.addEventListener('click', () => {
			arrow.classList.toggle('expanded')
			children.classList.toggle('visible')
			icon.innerHTML = arrow.classList.contains('expanded')
				? getIcon(node.name, true, true)
				: getIcon(node.name, true, false)
		})

		item.appendChild(header)
		item.appendChild(children)
	} else {
		const spacer = document.createElement('span')
		spacer.style.width = '20px'
		spacer.style.display = 'inline-block'
		header.appendChild(spacer)

		const icon = document.createElement('span')
		icon.className = 'tree-icon'
		icon.innerHTML = getIcon(node.name, false)
		header.appendChild(icon)

		const label = document.createElement('span')
		label.textContent = node.name
		header.appendChild(label)

		header.addEventListener('click', async () => {
			try {
				const content = await invoke('read_file', { path: node.path })
				showFileModal(node.name, content)
			} catch (error) {
				alert(`Error reading file: ${error}`)
			}
		})

		item.appendChild(header)
	}

	return item
}

function renderTree(tree) {
	const container = document.getElementById('tree')
	container.innerHTML = ''
	container.appendChild(createTreeItem(tree))
	document.getElementById('exportBtn').disabled = false
}

function showFileModal(fileName, content) {
	const modal = document.getElementById('modal')
	const fileNameEl = document.getElementById('fileName')
	const contentEl = document.getElementById('fileContent')

	// 1. Устанавливаем имя файла
	fileNameEl.textContent = fileName

	// 2. ВАЖНО: Полностью сбрасываем содержимое и классы
	contentEl.removeAttribute('data-highlighted') // Убираем маркер highlight.js
	contentEl.className = '' // Сбрасываем все классы
	contentEl.textContent = content // Вставляем чистый текст

	// 3. Определяем язык
	const ext = '.' + fileName.split('.').pop().toLowerCase()
	const lang = EXTENSION_MAP[ext]

	// 4. Добавляем класс языка
	if (lang) {
		contentEl.classList.add(`language-${lang}`)
	}

	// 5. Запускаем подсветку с нуля
	if (window.hljs) {
		hljs.highlightElement(contentEl)
	}

	modal.classList.add('active')
}

async function handleSelectFolder() {
	try {
		const selected = await open({
			directory: true,
			multiple: false,
		})

		if (selected) {
			const welcomeScreen = document.getElementById('welcomeScreen')
			const treeView = document.getElementById('tree')
			const headerBtn = document.getElementById('selectBtnHeader')

			if (welcomeScreen) welcomeScreen.classList.add('hidden')
			if (treeView) treeView.classList.remove('hidden')
			if (headerBtn) headerBtn.classList.remove('hidden')

			currentTree = await invoke('scan_directory', { path: selected })
			renderTree(currentTree)
		}
	} catch (error) {
		console.error(error)
		alert(`Error: ${error}`)
	}
}

// Привязка обработчиков
const btnCenter = document.getElementById('selectBtnCenter')
if (btnCenter) btnCenter.addEventListener('click', handleSelectFolder)

const btnHeader = document.getElementById('selectBtnHeader')
if (btnHeader) btnHeader.addEventListener('click', handleSelectFolder)

const btnOld = document.getElementById('selectBtn')
if (btnOld) btnOld.addEventListener('click', handleSelectFolder)

document.getElementById('exportBtn').addEventListener('click', async () => {
	const treeEl = document.getElementById('tree')
	const canvas = await html2canvas(treeEl, {
		backgroundColor: '#18181b',
		scale: 2,
	})

	canvas.toBlob(
		blob => {
			const url = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `project-tree-${Date.now()}.webp`
			a.click()
			URL.revokeObjectURL(url)
		},
		'image/webp',
		0.95
	)
})

window.addEventListener('click', e => {
	const modal = document.getElementById('modal')
	if (e.target === modal) {
		modal.classList.remove('active')
	}
})
