const { default: axios } = require('axios')
const cheerio = require('cheerio')
const fastArrayDiff = require('fast-array-diff')
const fs = require('fs')

axios.get('https://boards.greenhouse.io/andela').then(res => {
  const $ = cheerio.load(res.data)

  const jobs = $('div.opening').map(function () {
    const name = $(this).find('a[data-mapped][href]').text()
    const link = $(this).find('a[data-mapped][href]').attr('href')
    const location = $(this).find('span.location').text()

    return {
      name, link, location
    }
  }).toArray()

  if(fs.existsSync('andela-jobs.json')) {
    const oldJson = fs.readFileSync('andela-jobs.json', 'utf-8')
    const oldJobs = JSON.parse(oldJson)

    const diff = fastArrayDiff.diff(oldJobs, jobs, (a, b) => {
      return a.name === b.name && a.link === b.link && a.location === b.location
    })

    if (diff.added.length > 0) {
      console.log('======added======')
      diff.added.forEach(item => {
        console.log(item)
      })
    }

    if (diff.removed.length > 0) {
      console.log('======removed======')
      diff.removed.forEach(item => {
        console.log(item)
      })
    }
  }
  else {
    jobs.forEach(job => {
      console.log(job)
    })
  }
  fs.writeFileSync('andela-jobs.json', JSON.stringify(jobs, null, 2))
}).catch(err => console.error(err))