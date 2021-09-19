import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client'
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import { FaRegClock } from 'react-icons/fa'
import { RiCalendarLine } from 'react-icons/ri';
import { MdPersonOutline } from 'react-icons/md';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function PostPage({ post }: PostProps): JSX.Element {
  const totalWord = post.data.content.reduce((total, contentItem) => {
    total += contentItem.heading.split(" ").length;

    const words = contentItem.body.map(item => item.text.split(" ").length);
    words.map(word => (total += word));

    return (total);
  }, 0);

  const readTime = (totalWord / 200)

  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }
  const formattedDate = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy',
    {
      locale: ptBR,
    }
  )


  return (
    <>
      <Header />
      <img src={post.data.banner?.url} alt="banner" className={styles.banner} />
      <main className={commonStyles.container}>
        <div className={styles.post}>
          <div className={styles.postTop}>
            <h1>{post.data.title}</h1>
            <ul className={styles.info}>
              <li> <time> <RiCalendarLine className={styles.logoTipo} /> {formattedDate} </time></li>
              <li> <MdPersonOutline className={styles.logoTipo} /> {post.data.author}</li>
              <li> <FaRegClock className={styles.logoTipo} /> {`4 min`}</li> 
            </ul>
          </div>
          {
            post.data.content.map(content => (
              <article className={commonStyles.container} key={content.heading}>
                <h1>{content.heading}</h1>
                <div className={styles.postContent} dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body) }} />
              </article>
            ))
          }
        </div>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'post'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid
      }
    }
  });

  return {
    paths,
    fallback: 'blocking'
  }
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const postId = await prismic.getByUID('post', String(slug), {});

  const post = {
    uid: postId.uid,
    first_publication_date: postId.first_publication_date,
    last_publication_date: postId.last_publication_date,
    data: {
      title: postId.data.title,
      subtitle: postId.data.subtitle,
      author: postId.data.author,
      banner: {
        url: postId.data.banner.url,
      },
      content: postId.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };


  return {
    props: {
      post,
    }
  }
};
