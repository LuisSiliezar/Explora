# Image credits

The activity card photos in `src/assets/images/activities/` were picked on [Cosmos](https://www.cosmos.so) and downloaded from its CDN. They were resized to 480px and compressed to JPEG quality 70. The uploader is the name Cosmos shows; it may not be the original photographer.

> **Placeholder art for this technical assessment only.** None of these images has a verified license. They must be replaced with licensed or owned photos before any store or public distribution.

The photos are used on the activity cards, the activity detail header and the onboarding step cards (category photos). They are bundled, not loaded from the web, so everything looks the same offline. The lookup is `activityImage()` in `src/presentation/theme/activityImages.ts`:

1. It uses the activity's own photo. For dev-seed copies like `act-001-3`, it uses `act-001`.
2. Otherwise it uses the category photo (for example, refresh-generated activities).
3. If an image fails to load, `ActivityThumb` falls back to `DurationTile`.

| File                   | Used for                 | Cosmos CDN id                        | Uploader on Cosmos             |
| ---------------------- | ------------------------ | ------------------------------------ | ------------------------------ |
| act-001.jpg            | Botanical Garden Walk    | d64d8160-0362-48f1-bac8-943fa85c7974 | llporpecc                      |
| act-002.jpg            | Sunset Walk              | db3f27ac-ea24-4755-98db-6b54217aaa66 | not named                      |
| act-003.jpg            | Viewpoint Trail          | 632b8cdb-30ab-4a37-82b2-b11b3e97c4bd | worldby2                       |
| act-004.jpg            | Photography Exhibition   | 477a454b-3733-4381-995f-36b598c7a1f9 | not named                      |
| act-005.jpg            | Museum of Inventions     | ccf58cbb-d2b3-4737-ba2b-409f9b84db8b | Kay Huang                      |
| act-006.jpg            | Short Story Reading      | e977c6df-1001-4abc-b69c-e01f5ee0e219 | mr.iconicc                     |
| act-007.jpg            | Pottery Workshop         | 0423c385-5a0e-4969-9ae0-e10f2558f407 | Свідомий відпочинок у Карпатах |
| act-008.jpg            | Drawing Workshop         | 719fa471-c64e-4595-ba88-29f900ebd87c | Bellaturgia Leparasi           |
| act-009.jpg            | Urban Gardening Workshop | 9de6c4a1-3070-4b89-98b9-663145691d0c | ebobbio                        |
| act-010.jpg            | Board Games              | 18e9b2c6-5964-4d75-8055-90a5f41e25b2 | Gogo ツ                        |
| act-011.jpg            | Classic Film Session     | 1bde3a5f-f3d2-4d4a-84ec-2d0370e90aae | mbrocker                       |
| act-012.jpg            | Puzzle Gathering         | 64c4f022-3d92-4f70-ba5b-711bbcbc1813 | withoutonyx                    |
| category-outdoors.jpg  | Outdoors fallback        | a46beeb2-6943-4770-ba52-d9c34b94ddc7 | heyitslizb                     |
| category-culture.jpg   | Culture fallback         | fd5ff78f-584a-4383-a985-119d9b302003 | not named                      |
| category-workshops.jpg | Workshops fallback       | 51ee99b9-55d4-40c5-9b3e-06132896ec5c | Fukatsumi                      |
| category-leisure.jpg   | Leisure fallback         | 8c665a40-f4e0-47ce-9f17-a79406dd0214 | GENZOU                         |

The original is at `https://cdn.cosmos.so/<id>`.
