import createWindow from './create-window';


export {
  createWindow,
  markdown
};


const markdown = `

<img src="https://raw.githubusercontent.com/ahmedsaheed/Leaflet/master/renderer/public/images/test.png" align="left" width="220"/>

<br>

## LEAFLET
A minimal distractionless markdown editor designed to quickly navigate between multiple \`.md\` files in a directory and its sub directories. It features a clean mathematical typesetting, chemical equation rendering, code blocks highlighting, writing statistics and a scroll indicator.

<br>

---
<br>
I created this <a href="http://github.com/ahmedsaheed/Leaflet" target="_blank" rel="noreferrer" class="external">application</a> to help me cope with note taking during school lectures as most of my lecturers spoke too fast. This application is made available as a free and <a href="https://github.com/ahmedsaheed/Leaflet" target="_blank" rel="noreferrer" class="external ">open source</a> software.


>You'd have to install <a href="https://github.com/jgm/pandoc/blob/master/INSTALL.md" target="_blank" rel="noreferrer" class="external">pandoc</a> to export \`.md\` to other formats.

---
## Features

- **Editing**: Switch between editing and preview mode seemlessly

- **Maths & Chemical Equation Typesetting**: Leaflet renders mathematical, physics and chemical equation out of the box.

- **Pandoc Support**: Easily export your \`.md\` files to \`.pdf\` and \`.docx\` files

- **Suggested Words**: Leaflet has a dictionary of about 5000 words and recommends synonyms.

- **Uses Files**: Leaflet works with users file system directly instead of an external database.

- **Dark / Light Mode**: Supports your system specified theme.

- **Simplicity**: Leaflet focuses on simplicity and provides only necessary features needed.


- **Bidirectional Text**: Automatically detect BIDI - text and displays logiaclly.
---
## Shortcuts and Controls

### General
- <kbd>⌘ | Ctrl</kbd> + <kbd>n</kbd> : New
- <kbd>⌘ | Ctrl</kbd> + <kbd>s</kbd> : Save
- <kbd>⌘ | Ctrl</kbd> + <kbd>o</kbd> : Open
- <kbd>⌘ | Ctrl</kbd> + <kbd>i</kbd> : Insert
- <kbd>⌘ | Ctrl</kbd> + <kbd>p</kbd> : Preview
- <kbd>⌘ | Ctrl</kbd> + <kbd>d</kbd> : Convert to Docx
- <kbd>⌘ | Ctrl</kbd> + <kbd>e</kbd> : Convert to PDF
- <kbd>Shift</kbd> + <kbd>Tab</kbd> : Toggle Suggested Word



### Quick Insert
- <kbd>⌘ | Ctrl</kbd> + <kbd>y</kbd> : Date
- <kbd>⌘ | Ctrl</kbd> + <kbd>t</kbd> : Time
- <kbd>⌘ | Ctrl</kbd> + <kbd>f</kbd> : Finder
- <kbd>⌘ | Ctrl</kbd> + <kbd>/</kbd> : Comment

---
## Examples

- Maths:

$$\\left( \\sum_{k=1}^n a_k b_k \\right)^2 \\leq \\left( \\sum_{k=1}^n a_k^2 \\right) \\left( \\sum_{k=1}^n b_k^2 \\right)$$

- Chemical Equation:
$$H_2 + O_2 = H_2O$$

- Code Blocks:
\`\`\`go\n
func threeSum(nums []int) [][]int {
  res := [][]int{}
  sort.Ints(nums)
  for i := range nums {
      if i > 0 && nums[i] == nums[i-1] {
          continue
      }
      j, k := i+1, len(nums)-1
      for j < k {
          sum := nums[i] + nums[j] + nums[k]
          switch {
          case sum < 0:
              j++
          case sum > 0:
              k--
          default:
              res = append(res, []int{nums[i], nums[j], nums[k]})
              j, k = next(nums, j, k)
          }
      }
  }
  return res
}
func next(nums []int, i, j int) (int, int) {
  for i < j {
      switch {
      case nums[i] == nums[i+1]:
          i++
      case nums[j] == nums[j-1]:
          j--
      default:
          i++
          j--
      }
  }
  
\n\`\`\`


- Tables:

| Tables   |      Are      |  Cool |
|----------|:-------------:|------:|
| col 1 is |  left-aligned | $1600 |
| col 2 is |    centered   |   $12 |
| col 3 is | right-aligned |    $1 |


## More Features

- Support media like \`mp3\`, \`iframe\` and \`video\` 
- Displays a table of content on demand
- Renders task list, tables and footnotes  quite nicely 
- File statistics displayed in the footer (speed-reader, word count, date).

## Extras

- Leaflet is strongly inspired by [Left](https://github.com/hundredrabbits/left) and [Opus](https://github.com/pacocoursey/Opus).
- Leaflet source code  licensed under [BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
- Pull Requests are welcome!


`;


