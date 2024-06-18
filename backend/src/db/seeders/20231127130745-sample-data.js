const db = require('../models');
const Users = db.users;

const Events = db.events;

const Favorites = db.favorites;

const ItemListings = db.item_listings;

const Notifications = db.notifications;

const Reviews = db.reviews;

const EventsData = [
  {
    event_id: 2,

    event_name: 'J. Robert Oppenheimer',

    date_and_time: new Date(),

    location: 'Central Park, NY',

    description:
      'Join us for a day of thrifting and community fun at the local thrift market.',

    // type code here for "relation_many" field
  },

  {
    event_id: 5,

    event_name: 'Dmitri Mendeleev',

    date_and_time: new Date(),

    location: 'Downtown LA',

    description:
      'Swap your vintage clothing items with fellow thrift enthusiasts.',

    // type code here for "relation_many" field
  },

  {
    event_id: 4,

    event_name: 'Hans Selye',

    date_and_time: new Date(),

    location: 'San Francisco, CA',

    description:
      'Explore a wide range of antique items at the annual antique fair.',

    // type code here for "relation_many" field
  },

  {
    event_id: 3,

    event_name: 'Justus Liebig',

    date_and_time: new Date(),

    location: 'Chicago, IL',

    description:
      'Recycle your old electronics responsibly at our community event.',

    // type code here for "relation_many" field
  },
];

const FavoritesData = [
  {
    favorite_id: 6,

    // type code here for "relation_one" field

    // type code here for "relation_one" field
  },

  {
    favorite_id: 8,

    // type code here for "relation_one" field

    // type code here for "relation_one" field
  },

  {
    favorite_id: 3,

    // type code here for "relation_one" field

    // type code here for "relation_one" field
  },

  {
    favorite_id: 8,

    // type code here for "relation_one" field

    // type code here for "relation_one" field
  },
];

const ItemListingsData = [
  {
    listing_id: 5,

    // type code here for "relation_one" field

    title: 'Comte de Buffon',

    description: 'Jean Piaget',

    price: 13.89,

    category: 'HomeDecor',

    // type code here for "images" field

    expiration_date: new Date(),

    // type code here for "relation_many" field
  },

  {
    listing_id: 9,

    // type code here for "relation_one" field

    title: 'Andreas Vesalius',

    description: 'Galileo Galilei',

    price: 17.92,

    category: 'HomeDecor',

    // type code here for "images" field

    expiration_date: new Date(),

    // type code here for "relation_many" field
  },

  {
    listing_id: 8,

    // type code here for "relation_one" field

    title: 'Neils Bohr',

    description: 'Lucretius',

    price: 58.36,

    category: 'Electronics',

    // type code here for "images" field

    expiration_date: new Date(),

    // type code here for "relation_many" field
  },

  {
    listing_id: 1,

    // type code here for "relation_one" field

    title: 'Andreas Vesalius',

    description: 'Tycho Brahe',

    price: 67.94,

    category: 'HomeDecor',

    // type code here for "images" field

    expiration_date: new Date(),

    // type code here for "relation_many" field
  },
];

const NotificationsData = [
  {
    notification_id: 7,

    // type code here for "relation_one" field

    message: 'Leonard Euler',

    timestamp: new Date(),
  },

  {
    notification_id: 5,

    // type code here for "relation_one" field

    message: 'Nicolaus Copernicus',

    timestamp: new Date(),
  },

  {
    notification_id: 5,

    // type code here for "relation_one" field

    message: 'Edward Teller',

    timestamp: new Date(),
  },

  {
    notification_id: 7,

    // type code here for "relation_one" field

    message: 'Antoine Laurent Lavoisier',

    timestamp: new Date(),
  },
];

const ReviewsData = [
  {
    review_id: 7,

    // type code here for "relation_one" field

    // type code here for "relation_one" field

    rating: 5,

    comment: 'Great seller! The item was exactly as described.',
  },

  {
    review_id: 6,

    // type code here for "relation_one" field

    // type code here for "relation_one" field

    rating: 4,

    comment: 'Good experience, but the shipping was a bit slow.',
  },

  {
    review_id: 5,

    // type code here for "relation_one" field

    // type code here for "relation_one" field

    rating: 5,

    comment: 'Excellent quality and fast response from the seller.',
  },

  {
    review_id: 6,

    // type code here for "relation_one" field

    // type code here for "relation_one" field

    rating: 3,

    comment: "The item had a small flaw that wasn't mentioned.",
  },
];

// Similar logic for "relation_many"

// Similar logic for "relation_many"

async function associateFavoriteWithUser() {
  const relatedUser0 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Favorite0 = await Favorites.findOne({
    order: [['id', 'ASC']],
    offset: 0,
  });
  if (Favorite0?.setUser) {
    await Favorite0.setUser(relatedUser0);
  }

  const relatedUser1 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Favorite1 = await Favorites.findOne({
    order: [['id', 'ASC']],
    offset: 1,
  });
  if (Favorite1?.setUser) {
    await Favorite1.setUser(relatedUser1);
  }

  const relatedUser2 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Favorite2 = await Favorites.findOne({
    order: [['id', 'ASC']],
    offset: 2,
  });
  if (Favorite2?.setUser) {
    await Favorite2.setUser(relatedUser2);
  }

  const relatedUser3 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Favorite3 = await Favorites.findOne({
    order: [['id', 'ASC']],
    offset: 3,
  });
  if (Favorite3?.setUser) {
    await Favorite3.setUser(relatedUser3);
  }
}

async function associateFavoriteWithTarget_listing() {
  const relatedTarget_listing0 = await ItemListings.findOne({
    offset: Math.floor(Math.random() * (await ItemListings.count())),
  });
  const Favorite0 = await Favorites.findOne({
    order: [['id', 'ASC']],
    offset: 0,
  });
  if (Favorite0?.setTarget_listing) {
    await Favorite0.setTarget_listing(relatedTarget_listing0);
  }

  const relatedTarget_listing1 = await ItemListings.findOne({
    offset: Math.floor(Math.random() * (await ItemListings.count())),
  });
  const Favorite1 = await Favorites.findOne({
    order: [['id', 'ASC']],
    offset: 1,
  });
  if (Favorite1?.setTarget_listing) {
    await Favorite1.setTarget_listing(relatedTarget_listing1);
  }

  const relatedTarget_listing2 = await ItemListings.findOne({
    offset: Math.floor(Math.random() * (await ItemListings.count())),
  });
  const Favorite2 = await Favorites.findOne({
    order: [['id', 'ASC']],
    offset: 2,
  });
  if (Favorite2?.setTarget_listing) {
    await Favorite2.setTarget_listing(relatedTarget_listing2);
  }

  const relatedTarget_listing3 = await ItemListings.findOne({
    offset: Math.floor(Math.random() * (await ItemListings.count())),
  });
  const Favorite3 = await Favorites.findOne({
    order: [['id', 'ASC']],
    offset: 3,
  });
  if (Favorite3?.setTarget_listing) {
    await Favorite3.setTarget_listing(relatedTarget_listing3);
  }
}

async function associateItemListingWithSeller() {
  const relatedSeller0 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const ItemListing0 = await ItemListings.findOne({
    order: [['id', 'ASC']],
    offset: 0,
  });
  if (ItemListing0?.setSeller) {
    await ItemListing0.setSeller(relatedSeller0);
  }

  const relatedSeller1 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const ItemListing1 = await ItemListings.findOne({
    order: [['id', 'ASC']],
    offset: 1,
  });
  if (ItemListing1?.setSeller) {
    await ItemListing1.setSeller(relatedSeller1);
  }

  const relatedSeller2 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const ItemListing2 = await ItemListings.findOne({
    order: [['id', 'ASC']],
    offset: 2,
  });
  if (ItemListing2?.setSeller) {
    await ItemListing2.setSeller(relatedSeller2);
  }

  const relatedSeller3 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const ItemListing3 = await ItemListings.findOne({
    order: [['id', 'ASC']],
    offset: 3,
  });
  if (ItemListing3?.setSeller) {
    await ItemListing3.setSeller(relatedSeller3);
  }
}

// Similar logic for "relation_many"

async function associateNotificationWithUser() {
  const relatedUser0 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Notification0 = await Notifications.findOne({
    order: [['id', 'ASC']],
    offset: 0,
  });
  if (Notification0?.setUser) {
    await Notification0.setUser(relatedUser0);
  }

  const relatedUser1 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Notification1 = await Notifications.findOne({
    order: [['id', 'ASC']],
    offset: 1,
  });
  if (Notification1?.setUser) {
    await Notification1.setUser(relatedUser1);
  }

  const relatedUser2 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Notification2 = await Notifications.findOne({
    order: [['id', 'ASC']],
    offset: 2,
  });
  if (Notification2?.setUser) {
    await Notification2.setUser(relatedUser2);
  }

  const relatedUser3 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Notification3 = await Notifications.findOne({
    order: [['id', 'ASC']],
    offset: 3,
  });
  if (Notification3?.setUser) {
    await Notification3.setUser(relatedUser3);
  }
}

async function associateReviewWithReviewer() {
  const relatedReviewer0 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Review0 = await Reviews.findOne({
    order: [['id', 'ASC']],
    offset: 0,
  });
  if (Review0?.setReviewer) {
    await Review0.setReviewer(relatedReviewer0);
  }

  const relatedReviewer1 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Review1 = await Reviews.findOne({
    order: [['id', 'ASC']],
    offset: 1,
  });
  if (Review1?.setReviewer) {
    await Review1.setReviewer(relatedReviewer1);
  }

  const relatedReviewer2 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Review2 = await Reviews.findOne({
    order: [['id', 'ASC']],
    offset: 2,
  });
  if (Review2?.setReviewer) {
    await Review2.setReviewer(relatedReviewer2);
  }

  const relatedReviewer3 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Review3 = await Reviews.findOne({
    order: [['id', 'ASC']],
    offset: 3,
  });
  if (Review3?.setReviewer) {
    await Review3.setReviewer(relatedReviewer3);
  }
}

async function associateReviewWithTarget_listing() {
  const relatedTarget_listing0 = await ItemListings.findOne({
    offset: Math.floor(Math.random() * (await ItemListings.count())),
  });
  const Review0 = await Reviews.findOne({
    order: [['id', 'ASC']],
    offset: 0,
  });
  if (Review0?.setTarget_listing) {
    await Review0.setTarget_listing(relatedTarget_listing0);
  }

  const relatedTarget_listing1 = await ItemListings.findOne({
    offset: Math.floor(Math.random() * (await ItemListings.count())),
  });
  const Review1 = await Reviews.findOne({
    order: [['id', 'ASC']],
    offset: 1,
  });
  if (Review1?.setTarget_listing) {
    await Review1.setTarget_listing(relatedTarget_listing1);
  }

  const relatedTarget_listing2 = await ItemListings.findOne({
    offset: Math.floor(Math.random() * (await ItemListings.count())),
  });
  const Review2 = await Reviews.findOne({
    order: [['id', 'ASC']],
    offset: 2,
  });
  if (Review2?.setTarget_listing) {
    await Review2.setTarget_listing(relatedTarget_listing2);
  }

  const relatedTarget_listing3 = await ItemListings.findOne({
    offset: Math.floor(Math.random() * (await ItemListings.count())),
  });
  const Review3 = await Reviews.findOne({
    order: [['id', 'ASC']],
    offset: 3,
  });
  if (Review3?.setTarget_listing) {
    await Review3.setTarget_listing(relatedTarget_listing3);
  }
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Events.bulkCreate(EventsData);

    await Favorites.bulkCreate(FavoritesData);

    await ItemListings.bulkCreate(ItemListingsData);

    await Notifications.bulkCreate(NotificationsData);

    await Reviews.bulkCreate(ReviewsData);

    await Promise.all([
      // Similar logic for "relation_many"

      // Similar logic for "relation_many"

      await associateFavoriteWithUser(),

      await associateFavoriteWithTarget_listing(),

      await associateItemListingWithSeller(),

      // Similar logic for "relation_many"

      await associateNotificationWithUser(),

      await associateReviewWithReviewer(),

      await associateReviewWithTarget_listing(),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('events', null, {});

    await queryInterface.bulkDelete('favorites', null, {});

    await queryInterface.bulkDelete('item_listings', null, {});

    await queryInterface.bulkDelete('notifications', null, {});

    await queryInterface.bulkDelete('reviews', null, {});
  },
};
