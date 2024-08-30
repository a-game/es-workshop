# Verify setup: You Know, for Search
```
GET /
```

# The index
```
PUT movies
```

# Look at it, isin't it neat
```
GET movies
```
# -- slide Add data

# Add data
```
PUT movies/_doc/tt0076759
{
    "id": "tt0076759",
    "title": "Star Wars",
    "overview": "Long ago, in a galaxy far away",
    "poster": "https://static.wikia.nocookie.net/starwars/images/2/29/Admiral_Ackbar_RH.png",
    "runtime": 121,
    "popularity": 9001,
    "genres": [
        "Documentary"
    ],
    "released": "1977-05-25"
}
```

# It's just a DB so you can Get by id
```
GET movies/_doc/tt0076759
```
# -- slide find data

# Select *
```
GET movies/_search
{
    "query": {
        "match_all": {}
    }
}
```

# Find by title
```
GET movies/_search
{
    "query": {
        "match": {
            "title": "Star"
        }
    }
}
```
# -- slide thanks

# But it's a search engine, I want to search
# Why doesn't this work ?! (╯°□°)╯︵ ┻━┻
```
GET movies/_search
{
    "query": {
        "match": {
            "title": "Sta"
        }
    }
}
```

# Let's look at the index again
```
GET movies
```
# -- slide mappings

# Let's start over
```
PUT movies-01
{
    "mappings": {
        "properties": {
            "id": {
                "type": "keyword",
                "index": "false"
            },
            "title": {
                "type": "text"
            }
        }
    }
}
```
# Add data (again)
```
PUT movies-01/_doc/tt0076759
{
    "id": "tt0076759",
    "title": "Star Wars",
    "overview": "Long ago, in a galaxy far away",
    "poster": "https://static.wikia.nocookie.net/starwars/images/2/29/Admiral_Ackbar_RH.png",
    "runtime": 121,
    "popularity": 9001,
    "genres": [
        "Documentary"
    ],
    "released": "1977-05-25"
}
```

# Let's see what we've acomplished...
```
GET movies-01
```

# This still doesn't work (╯°Д°)╯︵/(.□ . \)
```
GET movies-01/_search
{
    "query": {
        "match": {
            "title": "Sta"
        }
    }
}

# the title field actually uses the standard (default) analyzer
# "title": {
#    "type": "text",
#    "analyzer": "standard", 
#
# }
```
# -- slide analysis

```
POST _analyze
{
    "analyzer": "standard",
    "text": "Star Wars"
}
```

# Let's start over (again)
```
PUT movies-02
{
    "settings": {
        "analysis": {
            "tokenizer": {
                "my_tokenizer": {
                    "type": "edge_ngram",
                    "min_gram": 1,
                    "max_gram": 20,
                    "token_chars": [
                        "letter",
                        "digit"
                    ]
                }
            },
            "analyzer": {
                "autocomplete_index": {
                    "tokenizer": "my_tokenizer",
                    "char_filter": [
                        "html_strip"
                    ],
                    "filter": [
                        "lowercase"
                    ]
                },
                "autocomplete_query": {
                    "tokenizer": "lowercase"
                }
            }
        }
    },
    "mappings": {
        "properties": {
            "id": {
                "type": "keyword",
                "index": "false"
            },
            "title": {
                "type": "text",
                "analyzer": "autocomplete_index",
                "search_analyzer": "autocomplete_query",
                "fields": {
                    "keyword": {
                        "type": "keyword"
                    }
                }
            },
            "overview": {
                "type": "text",
                "analyzer": "autocomplete_index",
                "search_analyzer": "autocomplete_query"
            }
        }
    }
}
```

# Add data (again) (again)
```
PUT movies-02/_doc/tt0076759
{
    "id": "tt0076759",
    "title": "Star Wars",
    "overview": "Long ago, in a galaxy far away",
    "poster": "https://static.wikia.nocookie.net/starwars/images/2/29/Admiral_Ackbar_RH.png",
    "runtime": 121,
    "popularity": 9001,
    "genres": [
        "Documentary"
    ],
    "released": "1977-05-25"
}
```

# (ง ͡ʘ ͜ʖ ͡ʘ)ง
```
GET movies-02/_search
{
    "query": {
        "match": {
            "title": "Sta"
        }
    }
}
```

# Let's see why
```
POST movies-02/_analyze
{
    "analyzer": "autocomplete_index",
    "text": "Sta"
}

POST movies-02/_analyze
{
    "analyzer": "autocomplete_query",
    "text": "Sta"
}
```

# Use the explain api to dig into all the details
```
GET movies-02/_explain/tt0076759
{
    "query": {
        "match": {
            "title": "Sta"
        }
    }
}
```

# Index a bunch of movies
# See that it's all there
```
GET movies-02/_count
```
# Now let's try to be a little more like google:
# 1. Search across multiple fields
# 2. Highlight hit-substrings
# 3. Boost results from title fields
```
GET movies-02/_search
{
    "query": {
        "multi_match": {
            "query": "star",
            "fields": [
                "title^2",
                "overview"
            ]
        }
    },
    "highlight": {
        "fields": {
            "title": {},
            "overview": {}
        }
    }
}
```

# Aggregations / Facets
# Very useful for exploring your data

# Explore stats
# Note on total: "track_total_hits": true, 
```
GET movies-02/_search?size=0
{
    "aggs": {
        "score_stats": {
            "stats": {
                "field": "popularity"
            }
        }
    }
}
```

# Histograms for continus numerical values like runtime or popularity
```
GET movies-02/_search?size=0
{
    "aggs": {
        "prices": {
            "histogram": {
                "field": "runtime",
                "interval": 10,
                "min_doc_count": 1
            }
        }
    }
}
```

# Term buckets
```
GET movies-02/_search?size=0
{
    "aggs": {
        "categories": {
            "terms": {
                "field": "genres.keyword"
            }
        }
    }
}
```
# Run in prod
### - alias
### - settings
### - reindex

```
GET movies*

DELETE movies
```
# Add an alias to existing index
```
POST _aliases 
{
    "actions": [
        {
            "add": {
                "index": "movies-02",
                "alias": "movies"
            }
        }
    ]
}
```
# Now we can use this alias to do all the things
```
GET movies
```
# So let's say we want to add some settings / mappings or any immutable thing.
# We do that into a new index
```
PUT movies-03
{
    "settings": {
        "index": {
            "number_of_shards": 3,
            "number_of_replicas": 2
        },
        "analysis": {
            "tokenizer": {
                "my_tokenizer": {
                    "type": "edge_ngram",
                    "min_gram": 1,
                    "max_gram": 20,
                    "token_chars": [
                        "letter",
                        "digit"
                    ]
                }
            },
            "analyzer": {
                "autocomplete_index": {
                    "tokenizer": "my_tokenizer",
                    "char_filter": [
                        "html_strip"
                    ],
                    "filter": [
                        "lowercase"
                    ]
                },
                "autocomplete_query": {
                    "tokenizer": "lowercase"
                }
            }
        }
    },
    "mappings": {
        "properties": {
            "id": {
                "type": "keyword",
                "index": "false"
            },
            "title": {
                "type": "text",
                "analyzer": "autocomplete_index",
                "search_analyzer": "autocomplete_query",
                "fields": {
                    "keyword": {
                        "type": "keyword"
                    }
                }
            },
            "overview": {
                "type": "text",
                "analyzer": "autocomplete_index",
                "search_analyzer": "autocomplete_query"
            },
            "genres": {
                "type": "keyword"
            }
        }
    }
}
```
# Reindex all the data.
# cli

# switch the alias
```
POST _aliases
{
    "actions": [
        {
            "remove": {
                "index": "movies-02",
                "alias": "movies"
            }
        },
        {
            "add": {
                "index": "movies-03",
                "alias": "movies"
            }
        }
    ]
}
```

# verify
```
GET movies
```

# Create a snapshot repo
```
PUT _snapshot/my_backup_repo
{
    "type": "fs",
    "settings": {
        "location": "my_backup_repo"
    }
}
```

# Create a snapshot
```
PUT _snapshot/my_bakcup_repo/my_snapshot
```
# Restore a snapshot
```
POST _snapshot/my_bakcup_repo/my_snapshot/_restore
{
    "indices": "my-index"
}
```