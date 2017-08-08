# exercism-uniconfig

Create a unified config.json file from all the separate exercism tracks.

## Usage

```shell
npm install -g exercism-uniconfig
exercism-uniconfig > uniconfig.json
```

## Output
The uniconfig file will have one piece of meta-data, a *generated* date. The rest of the tracks will be under *tracks* keyed by the track slug. The tracks will contain copies of their configuration files from the track's master branch at the time of generation.

```javascript
{
  "generated": "2017-08-08T20:46:05.744Z",
  "tracks": {
    "bash": {
      "language": "Bash",
      "checklist_issue": 4,
      "active": false,
      "exercises": [
        {
          "uuid": "4e2533dd-3af5-400b-869d-78140764d533",
          "slug": "hello-world",
          "core": true,
          "difficulty": 1,
          "topics": [
            "stdout"
          ]
        },
        // ...
      ]
    }
  }
}
```
