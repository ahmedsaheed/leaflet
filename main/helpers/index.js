import createWindow from './create-window';
import {Notification} from 'electron'


export {
  createWindow,
  markdown
};


const markdown = `
# Leaflet

<p align="center">



<video src="https://user-images.githubusercontent.com/87912847/188292656-94da4c10-7fb3-464f-8fad-270b255afaee.mov" controls="controls">
</video>


</p>

Leaflet, a **minimal distractionless markdown editor** designed to quickly navigate between multiple \`.md\` files in a directory and its sub directories. It features a clean mathematical typesetting, chemical equation rendering, code blocks highlighting, writing statistics and a speed-reader.


I created this <a href="http://github.com/ahmedsaheed/Leaflet" target="_blank" rel="noreferrer" class="external">application</a> to help me cope with note taking during school lectures as most of my lecturers spoke too fast. This application is made available as a free and <a href="https://github.com/ahmedsaheed/Leaflet" target="_blank" rel="noreferrer" class="external ">open source</a> software.

>You'd have to install <a href="https://github.com/jgm/pandoc/blob/master/INSTALL.md" target="_blank" rel="noreferrer" class="external">pandoc</a> to export \`.md\` to other formats.

## Features

- **Editing**: Switch between editing and preview mode seemlessly

- **Maths & Chemical Equation Typesetting**: Leaflet renders mathematical, physics and chemical equation out of the box.

- **Pandoc Support**: Easily export your \`.md\` files to \`.pdf\` and \`.docx\` files

- **Suggested Words**: Leaflet has a dictionary of about 5000 words and recommends synonyms.

- **Uses Files**: Leaflet works with users file system directly instead of an external database.

- **Dark / Light Mode**: Supports your system specified theme.

- **Simplicity**: Leaflet focuses on simplicity and provides only necessary features needed.


- **Bidirectional Text**: Automatically detect BIDI - text and displays logiaclly.



## Shortcuts and Controls

> Use <kbd>⌘/Ctrl + p</kbd> or <kbd>⌘/Ctrl + i</kbd>  to toggle between preview and insert mode respectively\.
> 
> While synonms are being suggested, use <kbd>Shift + tab</kbd> to insert the suggested word\.
>
> Use <kbd>⌘/Ctrl + s</kbd> to save your current file, although this happens automatically\.  
> 
> Use <kbd>⌘/Ctrl + n</kbd> to create a new \`.md\` file.  
> 
> Use <kbd>⌘/Ctrl + +</kbd> to add multiple/single file from your system.  
> 
> Use <kbd>⌘/Ctrl + d</kbd> to convert your current \`.md\` file into \`.docx\` file
> 
> Use <kbd>⌘/Ctrl + e</kbd> to convert your current \`.md\` file into \`.pdf\` file
>


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

- Footnotes:

Here's a simple footnote,[^1] and here's a longer one.[^bignote]
[^1]: This is the first footnote.
[^bignote]: Here's one with multiple paragraphs and code.
    Indent paragraphs to include them in the footnote.
    Add as many paragraphs as you like.

- Media Support

This is an iframe

<iframe width="500" height="315" src="https://www.youtube.com/embed/6cRctjPRv6M" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>

- BIDI Support

الحب بدلاً من المال ، أعطني الحقيقة. هذا كل ما سأطلبه .

 お金より愛より真実をください。それが私が求めるすべてです。


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


